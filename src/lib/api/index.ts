// API Service Layer
// ==================
// This is the main entry point for all database operations.
// 
// CURRENT: Oracle APEX REST API
// To switch back to localStorage, change oracleAPI to localStorageAPI

import { localStorageAPI } from './localStorage';
import { oracleAPI } from './oracle';

// Export types for use throughout the app
export * from './types';

// ============================================
// SWITCH BACKEND HERE:
// - oracleAPI: Oracle Autonomous Database via APEX REST
// - localStorageAPI: Browser localStorage (for testing)
// ============================================
export const api = oracleAPI;

// Storage event key for real-time updates (localStorage specific - not used with Oracle)
export const STORAGE_KEYS = {
  documents: 'dtd_documents',
  downloads: 'dtd_downloads', 
  comments: 'dtd_comments',
} as const;
