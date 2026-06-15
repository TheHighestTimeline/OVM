// posts-csv-import — bulk import draft posts from CSV into Airtable
// POST body: { client_id, csv: "platform,caption,...\n...", status }
import { ok, err, CORS } from './_notion.js';
import { requireAuth } from './_auth.js';
import { airtableCreateBatch, POSTS_MAP } from './_airtable.js';

const VALID_PLATFORMS    = new Set(['instagram','tiktok','facebook','youtube','threads']);
const VALID_TYPES        = new Set(['photo','video','carousel','reel','short','story','quote']);
const VALID_IMPORT_STATUS = new Set(['draft','pending_review']);

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
  return lines.slice(1).map(line => {
    const values = [];
    let cur = '', inQ = false;
    for (const ch of line) {
      if (ch === '"') { inQ = !inQ; }
      else if (ch === ',' && !inQ) { values.push(cur.trim()); cur = ''; }
      else cur += ch;
    }
    values.push(cur.trim());
    return Object.fromEntries(headers.map((h, i) => [h, values[i] || '']));
  });
}

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };
  const unauth = await requireAuth(event); if (unauth) return unauth;

  let body; try { body = JSON.parse(event.body || '{}'); } catch { return err(400, 'Invalid JSON'); }
  if (!body.client_id) return err(400, 'client_id required');
  if (!body.csv)       return err(400, 'csv required');

  const importStatus = VALID_IMPORT_STATUS.has(body.status) ? body.status : 'draft';
  const rows = parseCSV(body.csv);
  if (!rows.length) return err(400, 'CSV has no data rows');

  const toCreate = [];
  const failed   = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const platform = (row.platform || '').toLowerCase().trim();
    if (!VALID_PLATFORMS.has(platform)) {
      failed.push({ row: i + 2, reason: `Invalid platform: "${platform}"` });
      continue;
    }
    if (!row.caption?.trim()) {
      failed.push({ row: i + 2, reason: 'Caption is required' });
      continue;
    }
    const type = VALID_TYPES.has(row.type) ? row.type : 'photo';
    const scheduledAt = row.scheduled_for
      ? new Date(row.scheduled_for).toISOString()
      : null;

    toCreate.push({
      [POSTS_MAP.clientId]:    body.client_id,
      [POSTS_MAP.platform]:    platform,
      [POSTS_MAP.type]:        type,
      [POSTS_MAP.caption]:     row.caption.trim(),
      [POSTS_MAP.hashtags]:    row.hashtags || '',
      [POSTS_MAP.assetUrl]:    row.image_url || row.asset_url || '',
      [POSTS_MAP.status]:      importStatus,
      [POSTS_MAP.scheduledAt]: scheduledAt,
    });
  }

  try {
    const created = toCreate.length
      ? await airtableCreateBatch('Posts', toCreate)
      : [];
    return ok({ imported: created.length, failed, errors: failed });
  } catch (e) {
    console.error('[posts-csv-import]', e.message);
    return err(500, e.message);
  }
};
