// Backend API Implementation
// ===========================
// Connects to the Node.js/Express backend running on Oracle Cloud.
// Base URL is set via VITE_ORACLE_APEX_URL in .env
// Auth is JWT Bearer token stored in localStorage under 'dtd_token'.

import { DatabaseAPI, Document, Comment, Analytics, DownloadEvent, TimeRange, Folder } from './types';

const BASE_URL = import.meta.env.VITE_ORACLE_APEX_URL || 'https://129-213-123-67.sslip.io/api';

// Not used for APEX login anymore — kept for import compatibility
export const ORACLE_LOGIN_URL = '/login';

function getToken(): string | null {
  return localStorage.getItem('dtd_token');
}

async function apexFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (!response.ok) {
    const msg =
      response.status === 401 || response.status === 403
        ? `Sign in required (${response.status}). Please sign in to access this feature.`
        : `API error: ${response.status} ${response.statusText}`;
    throw new Error(msg);
  }
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

function toISODate(val: string | undefined): string {
  if (val == null || val === '') return new Date().toISOString();
  const d = new Date(val);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

// Backend document shape (already camelCase from server.js)
interface DocRow {
  id: number | string;
  title: string;
  course: string;
  professor: string;
  fileType: string;
  fileName: string;
  objectName?: string;
  uploadedAt: string;
  downloads?: number;
  folderId?: number | string | null;
  semester?: string;
  year?: number;
  uploadedBy?: string;
}

interface CommentRow {
  id: number | string;
  userName: string;
  content: string;
  createdAt: string;
}

interface FolderRow {
  id: number | string;
  name: string;
  description?: string;
  course: string;
  professor: string;
  createdAt: string;
  documentCount?: number;
}

export const oracleAPI: DatabaseAPI = {
  // ==================
  // DOCUMENTS
  // ==================

  async getDocuments(): Promise<Document[]> {
    const data = await apexFetch<DocRow[]>('/documents');
    return (data ?? []).map((doc) => ({
      id: String(doc.id),
      title: doc.title,
      course: doc.course,
      professor: doc.professor,
      fileType: doc.fileType,
      fileName: doc.fileName,
      uploadedAt: toISODate(doc.uploadedAt),
      downloads: doc.downloads || 0,
      folderId: doc.folderId != null ? String(doc.folderId) : undefined,
      objectName: doc.objectName,
    }));
  },

  async addDocument(doc: Omit<Document, 'id' | 'downloads'> & { uploadedBy?: string }): Promise<Document> {
    // This sends metadata only (no file). For actual file uploads use POST /upload with multipart.
    const result = await apexFetch<DocRow>('/documents', {
      method: 'POST',
      body: JSON.stringify({
        title: doc.title,
        course: doc.course,
        professor: doc.professor,
        fileType: doc.fileType,
        fileName: doc.fileName,
        uploadedAt: doc.uploadedAt,
        ...(doc.uploadedBy ? { uploadedBy: doc.uploadedBy } : {}),
      }),
    });
    return {
      id: String(result.id),
      title: result.title,
      course: result.course,
      professor: result.professor,
      fileType: result.fileType,
      fileName: result.fileName,
      uploadedAt: toISODate(result.uploadedAt),
      downloads: 0,
    };
  },

  async incrementDownload(documentId: string): Promise<void> {
    const userName = localStorage.getItem('dtd_email') || 'Anonymous';
    await apexFetch(`/documents/${documentId}/download`, {
      method: 'POST',
      body: JSON.stringify({ userName }),
    });
  },

  // ==================
  // COMMENTS
  // ==================

  async getComments(documentId?: string): Promise<Comment[]> {
    if (!documentId) return [];
    const data = await apexFetch<CommentRow[]>(`/documents/${documentId}/comments`);
    return (data ?? []).map((c) => ({
      id: String(c.id),
      documentId,
      author: c.userName,
      content: c.content,
      createdAt: toISODate(c.createdAt),
    }));
  },

  async addComment(documentId: string, author: string, content: string): Promise<Comment> {
    const result = await apexFetch<CommentRow>(`/documents/${documentId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ userName: author, content }),
    });
    return {
      id: String(result.id),
      documentId,
      author: result.userName,
      content: result.content,
      createdAt: toISODate(result.createdAt),
    };
  },

  async deleteComment(commentId: string): Promise<void> {
    await apexFetch(`/comments/${commentId}`, { method: 'DELETE' });
  },

  // ==================
  // ANALYTICS
  // ==================

  async getAnalytics(timeRange: TimeRange = 'month'): Promise<Analytics> {
    const data = await apexFetch<Analytics>(`/analytics?timeRange=${timeRange}`);
    return {
      totalDocuments: data.totalDocuments || 0,
      totalDownloads: data.totalDownloads || 0,
      uniqueCourses: data.uniqueCourses || 0,
      uniqueProfessors: data.uniqueProfessors || 0,
      uploadsOverTime: data.uploadsOverTime || [],
      courseDistribution: data.courseDistribution || [],
      documentTypes: data.documentTypes || [],
      topProfessors: data.topProfessors || [],
      downloadTrends: data.downloadTrends || [],
      recentActivity: (data.recentActivity || []).map((item) => ({
        ...item,
        timestamp: item.timestamp ? new Date(item.timestamp) : new Date(),
      })),
      timeRange,
    };
  },

  // ==================
  // DOWNLOAD EVENTS
  // ==================

  async getDownloadEvents(): Promise<DownloadEvent[]> {
    // Not a dedicated endpoint on this backend; return empty.
    return [];
  },

  // ==================
  // FOLDERS
  // ==================

  async getFolders(): Promise<Folder[]> {
    const data = await apexFetch<FolderRow[]>('/folders');
    return (data ?? []).map((f) => ({
      id: String(f.id),
      name: f.name,
      description: f.description || '',
      course: f.course,
      professor: f.professor,
      createdAt: toISODate(f.createdAt),
      documentCount: f.documentCount || 0,
    }));
  },

  async getFolder(folderId: string): Promise<Folder | null> {
    try {
      const f = await apexFetch<FolderRow>(`/folders/${folderId}`);
      return {
        id: String(f.id),
        name: f.name,
        description: f.description || '',
        course: f.course,
        professor: f.professor,
        createdAt: toISODate(f.createdAt),
        documentCount: f.documentCount || 0,
      };
    } catch {
      return null;
    }
  },

  async addFolder(folder: Omit<Folder, 'id' | 'documentCount' | 'createdAt'>): Promise<Folder> {
    const result = await apexFetch<FolderRow>('/folders', {
      method: 'POST',
      body: JSON.stringify({
        name: folder.name,
        description: folder.description,
        course: folder.course,
        professor: folder.professor,
      }),
    });
    return {
      id: String(result.id),
      name: result.name,
      description: result.description || '',
      course: result.course,
      professor: result.professor,
      createdAt: toISODate(result.createdAt),
      documentCount: 0,
    };
  },

  async deleteFolder(folderId: string): Promise<void> {
    await apexFetch(`/folders/${folderId}`, { method: 'DELETE' });
  },

  async getFolderDocuments(folderId: string): Promise<Document[]> {
    const data = await apexFetch<DocRow[]>(`/folders/${folderId}/documents`);
    return (data ?? []).map((doc) => ({
      id: String(doc.id),
      title: doc.title,
      course: doc.course,
      professor: doc.professor,
      fileType: doc.fileType,
      fileName: doc.fileName,
      uploadedAt: toISODate(doc.uploadedAt),
      downloads: doc.downloads || 0,
      folderId: String(folderId),
      objectName: doc.objectName,
    }));
  },

  async addDocumentsToFolder(
    folderId: string,
    docs: Omit<Document, 'id' | 'downloads' | 'folderId'>[]
  ): Promise<Document[]> {
    const results = await apexFetch<DocRow[]>(`/folders/${folderId}/documents`, {
      method: 'POST',
      body: JSON.stringify({
        documents: docs.map((doc) => ({
          title: doc.title,
          course: doc.course,
          professor: doc.professor,
          fileType: doc.fileType,
          fileName: doc.fileName,
          uploadedAt: doc.uploadedAt,
        })),
      }),
    });
    return (results ?? []).map((doc) => ({
      id: String(doc.id),
      title: doc.title,
      course: doc.course,
      professor: doc.professor,
      fileType: doc.fileType,
      fileName: doc.fileName,
      uploadedAt: toISODate(doc.uploadedAt),
      downloads: 0,
      folderId,
    }));
  },
};
