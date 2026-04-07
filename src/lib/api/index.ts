// API Service Layer
// ==================
// All data is stored on the Oracle APEX REST API — no localStorage.
// Set VITE_ORACLE_APEX_URL in .env to your Oracle Cloud (or local) backend URL;
// e.g. https://your-instance.adb.us-ashburn-1.oraclecloudapps.com/ords/yourworkspace/api

import { oracleAPI, ORACLE_LOGIN_URL } from './oracle';

export * from './types';
export { ORACLE_LOGIN_URL };

export const api = oracleAPI;

// Kept for useDatabase.ts event listener compatibility (no-op with Oracle)
export const STORAGE_KEYS = {
  documents: 'dtd_documents',
  downloads: 'dtd_downloads',
  comments: 'dtd_comments',
  folders: 'dtd_folders',
} as const;
