/**
 * clientManager.ts — Load client configs from Master Backend Sheet
 */

import { readSheetTab } from './googleSheets';

const MASTER_SHEET_ID = process.env.MASTER_SHEET_ID!;

export interface ClientConfig {
  businessId: string;
  businessName: string;
  ownerEmail: string;
  ownerPhone: string;
  tier: 'low' | 'medium' | 'high';
  packageKey: string;
  googleSheetId: string;
  twilioPhoneNumber: string;
  agentName: string;
  calendlyLink: string;
  businessHoursStart: string;
  businessHoursEnd: string;
  businessTimezone: string;
  active: boolean;
  // Outbound (high tier)
  outbound_enabled: boolean;
  outbound_mode: 'manual' | 'scheduled_every_30_minutes' | 'paused';
  outbound_daily_limit: number;
  outbound_call_window_start: string;
  outbound_call_window_end: string;
  outbound_timezone: string;
  monthlyOutboundLimit: number;
  outboundCallsUsedThisMonth: number;
  // Feature flags (resolved from tier)
  [key: string]: unknown;
}

let clientCache: ClientConfig[] | null = null;
let cacheExpiry = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getAllActiveClients(): Promise<ClientConfig[]> {
  if (clientCache && Date.now() < cacheExpiry) return clientCache;

  const rows = await readSheetTab(MASTER_SHEET_ID, 'Client Roster');
  const clients = (rows ?? []).slice(1)
    .filter(row => row[0] && row[14] === 'TRUE')  // col 14 = active
    .map(parseClientRow);

  clientCache = clients;
  cacheExpiry = Date.now() + CACHE_TTL;
  return clients;
}

export async function getClientByPhone(twilioPhone: string): Promise<ClientConfig | null> {
  const clients = await getAllActiveClients();
  return clients.find(c => c.twilioPhoneNumber === twilioPhone) ?? null;
}

export async function getClientById(businessId: string): Promise<ClientConfig | null> {
  const clients = await getAllActiveClients();
  return clients.find(c => c.businessId === businessId) ?? null;
}

// Force cache refresh (call after updating client roster)
export function invalidateClientCache(): void {
  clientCache = null;
  cacheExpiry = 0;
}

function parseClientRow(row: string[]): ClientConfig {
  return {
    businessId:                row[0],
    businessName:              row[1],
    ownerEmail:                row[2],
    ownerPhone:                row[3],
    tier:                      (row[4] as 'low' | 'medium' | 'high') || 'low',
    packageKey:                row[5],
    googleSheetId:             row[6],
    twilioPhoneNumber:         row[7],
    agentName:                 row[8] || 'Alex',
    calendlyLink:              row[9],
    businessHoursStart:        row[10] || '08:00',
    businessHoursEnd:          row[11] || '18:00',
    businessTimezone:          row[12] || 'America/Chicago',
    active:                    row[14] === 'TRUE',
    outbound_enabled:          row[15] === 'TRUE',
    outbound_mode:             (row[16] as any) || 'paused',
    outbound_daily_limit:      parseInt(row[17] ?? '20', 10),
    outbound_call_window_start: row[18] || '09:00',
    outbound_call_window_end:  row[19] || '19:00',
    outbound_timezone:         row[20] || 'America/Chicago',
    monthlyOutboundLimit:      parseInt(row[21] ?? '100', 10),
    outboundCallsUsedThisMonth: parseInt(row[22] ?? '0', 10),
  };
}

// Alias for backward compat
export const getClientConfig = getClientById;
