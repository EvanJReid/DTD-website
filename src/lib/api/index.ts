// API Service Layer
// ==================
// This is the main entry point for all database operations.
// 
// TO SWITCH TO ORACLE:
// 1. Create src/lib/api/oracle.ts implementing DatabaseAPI interface
// 2. Change the export below from localStorageAPI to oracleAPI
//
// Example Oracle implementation structure:
// ```
// export const oracleAPI: DatabaseAPI = {
//   async getDocuments() {
//     const response = await fetch('YOUR_ORACLE_APEX_URL/documents');
//     return response.json();
//   },
//   // ... implement other methods
// };
// ```

import { localStorageAPI } from './localStorage';

// Export types for use throughout the app
export * from './types';

// Current implementation: localStorage
// To switch to Oracle, import and export oracleAPI instead
export const api = localStorageAPI;

// Storage event key for real-time updates (localStorage specific)
export const STORAGE_KEYS = {
  documents: 'dtd_documents',
  downloads: 'dtd_downloads', 
  comments: 'dtd_comments',
} as const;
