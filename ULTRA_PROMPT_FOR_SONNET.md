# ULTRA PROMPT — OVM Social Media Dashboard Build-Out
**Paste this into Claude Sonnet. Fill in the `{{PLACEHOLDERS}}` block at the top, then send.**

---

## ====== FILL THESE IN BEFORE SENDING ======

```
PROJECT_ROOT_PATH        = {{ABSOLUTE_PATH_TO_REPO_ON_DISK}}
                           (example: C:\Users\STRIX MB\Documents\Claude\Projects\OVM Social Media Dashboard)

NOTION_API_KEY           = {{NOTION_INTEGRATION_SECRET}}
NOTION_CLIENTS_DB_ID     = {{NOTION_DATABASE_ID_FOR_CLIENTS}}   (leave blank if not created yet — agent will scaffold the schema doc)

GOOGLE_DRIVE_FOLDER_ID   = {{ROOT_DRIVE_FOLDER_ID_THAT_CONTAINS_CLIENT_SUBFOLDERS}}
GOOGLE_OAUTH_CLIENT_ID   = {{GOOGLE_OAUTH_CLIENT_ID}}
GOOGLE_OAUTH_SECRET      = {{GOOGLE_OAUTH_CLIENT_SECRET}}
GOOGLE_OAUTH_REDIRECT    = {{REDIRECT_URI_FOR_LOCAL_DEV}}        (default: http://localhost:3000/api/auth/google/callback)

SUPABASE_URL             = {{SUPABASE_PROJECT_URL}}
SUPABASE_ANON_KEY        = {{SUPABASE_ANON_KEY}}
SUPABASE_SERVICE_KEY     = {{SUPABASE_SERVICE_ROLE_KEY}}

SCRAPER_PROVIDER         = {{apify | brightdata | playwright_local}}   (default: playwright_local for V1)
SCRAPER_API_KEY          = {{API_KEY_OR_LEAVE_BLANK_IF_LOCAL}}

DEFAULT_TEST_CLIENT_NAME = {{NAME_OF_FIRST_FAKE_CLIENT_FOR_SAMPLE_DATA}}   (example: "Acme Coffee Co")
DEFAULT_TEST_HANDLES     = {{IG_HANDLE, TIKTOK_HANDLE}}                    (example: "@acmecoffee, @acme.coffee")
```

---

## ====== ROLE & MISSION ======

You are a senior full-stack engineer joining the **OVM Social Media Dashboard** project mid-flight. The repo already exists at `PROJECT_ROOT_PATH`. You are NOT starting from scratch — your first job is to read what's there, understand the architecture, and extend it.

The product is an AI-assisted social media management tool for agencies. The architecture the user has locked in:

- **Notion** = client knowledge base (brand voice, bios, content ideas, campaign notes, links to Drive assets)
- **Google Drive** = all heavy media (video, image, brand kits). Posts reference Drive file IDs/links — we do NOT re-upload blobs into Supabase storage.
- **Supabase** = operational layer only (posts, schedule queue, encrypted platform credentials, publish status, scrape results metadata)
- **Scraper layer** = for platforms where no API is available, pull *public* profile content so the AI has context on the client's existing voice/cadence

Your work happens in four ordered phases (defined below). **Phase 0 is the interactive dashboard prototype — build it first, get it perfect, only then move on.**

---

## ====== HARD RULES — DO NOT VIOLATE ======

1. **NO git operations.** Do not run `git add`, `git commit`, `git push`, `git checkout -b`, or any command that mutates git state. Edit files on disk only. The user will handle git themselves once they've reviewed your work.
2. **NO remote deploys.** No Vercel CLI, no Supabase migrations pushed to the cloud project, no Notion writes against the real workspace until Phase 2 explicitly says so. Phase 0 is 100% local + mocked.
3. **Local file system only.** All changes happen inside `PROJECT_ROOT_PATH`. Do not write outside that tree.
4. **Read before you write.** Before creating any file, run a directory walk of `PROJECT_ROOT_PATH` and read the existing `package.json`, `README.md`, any config files, and the entry point. Tell me what stack is already in place before generating code.
5. **Mock everything in Phase 0.** The interactive dashboard must run with zero credentials. All API calls return fake JSON from a `/mocks/` directory you create.
6. **Use the placeholders literally.** Anywhere a credential or ID is needed, reference it via `process.env.NOTION_API_KEY` style — never hardcode the value from the placeholders block. Generate a `.env.example` file mirroring the placeholders block.
7. **Stop and ask** if any of the following are true: the existing stack conflicts with the plan (e.g., repo is Python, not Node), the repo is empty, or `PROJECT_ROOT_PATH` doesn't exist.

---

## ====== PHASE 0 — INTERACTIVE DASHBOARD PROTOTYPE (BUILD THIS FIRST) ======

**Goal:** A single-file, runnable HTML/JSX dashboard the user can open in a browser and click around with realistic sample data — *before* a single line of real integration code is written. This is the design playground.

### Deliverable

Create `PROJECT_ROOT_PATH/prototype/dashboard.html` — a self-contained HTML file using React via CDN (React 18 + Babel standalone + Tailwind via CDN). Single file, no build step, double-click to open.

### Required views (use tab/sidebar navigation inside the prototype)

1. **Client Roster** — grid of client cards. Each card shows: avatar, name, IG/TikTok handles, post count this week, "needs approval" badge count, last-synced timestamp. Clicking a card opens the Client Detail view.
2. **Client Detail** — three tabs inside:
   - *Brand Profile* — pulled-from-Notion fields (voice description, target audience, do's & don'ts, brand colors swatches, bio). All editable inline (writes go to mock state, not Notion).
   - *Existing Content Context* — what the scraper would have pulled: last 12 posts with caption, hashtags, engagement, post type. Filter by platform.
   - *Drive Assets* — file picker view of that client's Drive folder. Folder tree on left, thumbnail grid on right. Items have a "Use in post" button.
3. **Content Calendar** — month view + week view toggle. Posts are draggable between days. Each post chip shows platform icon, scheduled time, status (`draft`, `pending_approval`, `scheduled`, `published`, `failed`).
4. **Post Composer** — modal that opens from "+ New Post". Fields:
   - Client picker
   - Platform multi-select (IG, TikTok, X, LinkedIn, Facebook, YouTube Shorts)
   - Caption textarea with character counter per platform
   - Hashtag suggestions row (clickable to insert)
   - Asset picker (opens the Drive picker from #2c, returns drive_file_id)
   - Schedule time picker
   - "Generate with AI" button — calls a mock `/api/generate` that returns 3 caption variants
   - Preview pane showing how it'll look on each selected platform
5. **Approvals Queue** — list of posts in `pending_approval` with thumbnail, caption preview, scheduled time, Approve/Reject buttons.
6. **Onboarding Wizard** — 4-step modal triggered from "+ Add Client":
   - Step 1: Name, agency-internal notes, Notion page link (auto-generated)
   - Step 2: Connect Drive folder (mock OAuth flow — just a fake "Connect" → "Connected" state change)
   - Step 3: Enter IG/TikTok public handles, click "Scrape existing content" — show a fake progress bar that fills, then displays a preview of the 12 most recent posts the scraper "found"
   - Step 4: Review & confirm — shows what will be written to Notion and Supabase

### Sample data requirements

Generate a `sampleData` object at the top of the file with:
- 4 fake clients (one of them is `DEFAULT_TEST_CLIENT_NAME` with handles `DEFAULT_TEST_HANDLES`)
- 30+ posts spread across past, present, and future dates, varied statuses
- 12 mock scraped posts per client with realistic captions, hashtags, engagement numbers
- A mock Drive folder tree with ~25 fake assets (mix of images and videos, fake thumbnails using placeholder.com or solid color divs)

The sample data must be **edited as a single object at the top of the file** so the user can swap in real client names/handles to test before any backend exists.

### Styling

- Tailwind CDN
- Dark mode default, with a toggle in the top-right
- Clean, modern agency-tool aesthetic — think Linear or Notion, not Hootsuite
- Sidebar nav with icons (use lucide-react via CDN or inline SVGs)
- All interactions feel real — hover states, transitions, optimistic UI updates

### Acceptance for Phase 0

Before moving to Phase 1, confirm with the user that the prototype:
- Opens by double-clicking the .html file
- All 6 views render without errors
- The onboarding wizard runs end-to-end with the fake scraper
- The user can edit `sampleData` at the top and see their changes reflected

**Do not start Phase 1 until the user explicitly says "Phase 0 looks good, move to Phase 1."**

---

## ====== PHASE 1 — NOTION CLIENT SYNC ======

**Trigger:** User has approved Phase 0.

### Steps

1. Read `PROJECT_ROOT_PATH/package.json`. Add `@notionhq/client` if not present (modify the file — do NOT run `npm install`; tell the user the install command to run).
2. Create `lib/notion/schema.md` — a markdown document defining the exact Notion database schema the Clients DB should have. Include every property name, type, and options list. This is what the user will use to set up their Notion DB if `NOTION_CLIENTS_DB_ID` is blank.
3. Create `lib/notion/client.ts` (or `.js` matching repo conventions) — typed wrapper around the Notion SDK:
   - `getClient(clientId)` — fetch one client page
   - `listClients()` — query the Clients DB
   - `upsertClient(clientData)` — create or update by name match
   - `linkDriveFolder(clientId, driveFolderId)` — write Drive folder ID to a client page property
4. Create `lib/notion/types.ts` — TS types matching the schema
5. Create `app/api/clients/route.ts` (or whatever routing pattern the existing repo uses) — REST endpoints backing the dashboard's Client Roster and Client Detail views
6. Update the prototype `dashboard.html` so a top-of-file flag `USE_REAL_BACKEND = false` can be flipped to `true` to call the real `/api/clients` endpoints instead of mock data

### Acceptance for Phase 1

User runs the dev server, flips the flag to `true`, and the dashboard pulls real clients from their Notion DB. **Stop and confirm before Phase 2.**

---

## ====== PHASE 2 — GOOGLE DRIVE INTEGRATION ======

**Trigger:** User has approved Phase 1.

### Steps

1. Add `googleapis` to `package.json` (do not install — tell the user)
2. Create `lib/drive/oauth.ts` — OAuth flow for connecting a user's Drive
3. Create `lib/drive/client.ts`:
   - `listFolder(folderId)` — return files + subfolders with thumbnails
   - `getFileMetadata(fileId)` — name, mimeType, thumbnailLink, webViewLink
   - `getDownloadUrl(fileId)` — for previewing in the composer
4. Create `app/api/drive/[clientId]/route.ts` — backed endpoint for the asset picker
5. Wire the prototype's Drive Assets tab and asset picker modal to the real endpoints when `USE_REAL_BACKEND = true`
6. Encrypt the Google OAuth refresh tokens before storing in Supabase using a `CREDS_ENCRYPTION_KEY` env var (generate instructions for creating one)

### Acceptance for Phase 2

User connects a real Drive folder via the onboarding wizard and sees real assets in the picker.

---

## ====== PHASE 3 — SCRAPER FOR ONBOARDING ======

**Trigger:** User has approved Phase 2.

### Scope

V1 scraper = **client profile scraper only**. Pulls the *client's own* public IG + TikTok posts. Trend/competitor scraping is V2 and explicitly out of scope.

### Steps

1. Based on `SCRAPER_PROVIDER`:
   - If `playwright_local` — create `lib/scraper/playwright/` with platform-specific extractors
   - If `apify` — create `lib/scraper/apify.ts` calling the appropriate Apify actor IDs
   - If `brightdata` — create `lib/scraper/brightdata.ts`
2. Common interface: `scrapeProfile(platform, handle) → { posts: [...], profile: {...} }`
3. Create `app/api/scrape/route.ts` — POST endpoint, runs async, writes results to Supabase `scrape_runs` table
4. Create the Supabase table migration in `supabase/migrations/` (write the SQL file — do NOT run migration against the cloud project; tell the user the command to run it themselves)
5. After scrape completes, write a summary to the client's Notion page under "Existing Content Context"
6. Wire the prototype's onboarding wizard step 3 to the real endpoint

### Acceptance for Phase 3

User onboards a new client and sees real scraped posts appear in the Existing Content Context tab.

---

## ====== PHASE 4 — PUBLISH FLOW + ASSET PICKER ======

**Trigger:** User has approved Phase 3.

### Steps

1. Create `lib/publish/` with one file per platform implementing a common interface:
   - `instagram.ts`, `tiktok.ts`, `x.ts`, `linkedin.ts`, `facebook.ts`, `youtube_shorts.ts`
   - Each exports `publish(post, credentials, driveAssetUrl) → { externalId, url, publishedAt }`
2. Where official APIs exist (IG Graph, FB Graph, LinkedIn, YouTube), use them. Where they don't (TikTok personal accounts, X for low-tier), document the gap and implement a stub that throws "not yet supported."
3. Create `app/api/posts/publish/route.ts` — pulls the queued post, decrypts credentials, fetches the Drive asset URL, calls the platform adapter, writes status back to Supabase + Notion.
4. Create a cron worker stub (`workers/publish-queue.ts`) — explain to the user how to run it (Vercel Cron, Railway worker, or local node script).
5. Wire the prototype's Post Composer + Approvals Queue + Calendar to real endpoints.

### Acceptance for Phase 4

User schedules a post in the dashboard, approves it, and it publishes to the real platform.

---

## ====== OUTPUT REQUIREMENTS — EVERY PHASE ======

After completing each phase, output:

1. **Files changed/created** — bulleted list with absolute paths
2. **What the user needs to run** — exact terminal commands (`npm install ...`, `supabase migration up`, etc.) — DO NOT run them yourself
3. **What the user needs to configure** — env vars, Notion DB properties to add manually, OAuth consent screen settings, etc.
4. **Test checklist** — 5–10 click-through steps the user should perform to verify the phase works
5. **Known gaps / V2 candidates** — what was stubbed or deferred

---

## ====== STYLE & QUALITY ======

- Match the existing repo's code style (read 2–3 existing files before writing)
- TypeScript if the repo uses it, JS otherwise
- Inline JSDoc/TSDoc on every exported function
- No `any` types unless unavoidable, with a comment explaining why
- Error handling on every external API call — never throw raw
- Console logs prefixed with `[ovm:phase-N]` so the user can grep them

---

## ====== BEGIN ======

Start by reading `PROJECT_ROOT_PATH`. Tell me:
1. What stack/framework is in the repo
2. What's already implemented
3. What you plan to do for Phase 0, in 5–8 bullets

Then wait for me to say "go" before generating Phase 0 code.
