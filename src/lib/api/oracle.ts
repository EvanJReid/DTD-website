// Oracle APEX REST API Implementation
// =====================================
// This adapter connects to Oracle Autonomous Database via APEX REST endpoints.
//
// SETUP REQUIRED:
// 1. Create an Oracle Autonomous Database (Free Tier works)
// 2. Enable APEX and create a workspace
// 3. Create REST modules with the endpoints below
// 4. Update ORACLE_APEX_BASE_URL with your APEX instance URL

import { DatabaseAPI, Document, Comment, Analytics, DownloadEvent, TimeRange } from './types';

// TODO: Replace with your Oracle APEX REST base URL
// Example: https://abc123-mydb.adb.us-ashburn-1.oraclecloudapps.com/ords/myworkspace/api
const ORACLE_APEX_BASE_URL = import.meta.env.VITE_ORACLE_APEX_URL || 'http://localhost:8080/ords/api';

// Helper for API calls
async function apexFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${ORACLE_APEX_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`Oracle APEX API error: ${response.status} ${response.statusText}`);
  }
  
  // Handle empty responses (like DELETE)
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

// Transform Oracle date format to ISO string
function toISODate(oracleDate: string): string {
  return new Date(oracleDate).toISOString();
}

export const oracleAPI: DatabaseAPI = {
  // ==================
  // DOCUMENTS
  // ==================
  
  async getDocuments(): Promise<Document[]> {
    const data = await apexFetch<{ items: any[] }>('/documents');
    return data.items.map(doc => ({
      id: String(doc.id),
      title: doc.title,
      course: doc.course,
      professor: doc.professor,
      fileType: doc.file_type,
      fileName: doc.file_name,
      uploadedAt: toISODate(doc.uploaded_at),
      downloads: doc.downloads || 0,
    }));
  },

  async addDocument(doc: Omit<Document, 'id' | 'downloads'>): Promise<Document> {
    const payload = {
      title: doc.title,
      course: doc.course,
      professor: doc.professor,
      file_type: doc.fileType,
      file_name: doc.fileName,
      uploaded_at: doc.uploadedAt,
    };
    
    const result = await apexFetch<any>('/documents', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    
    return {
      id: String(result.id),
      title: result.title,
      course: result.course,
      professor: result.professor,
      fileType: result.file_type,
      fileName: result.file_name,
      uploadedAt: toISODate(result.uploaded_at),
      downloads: 0,
    };
  },

  async incrementDownload(documentId: string): Promise<void> {
    // Record download event
    await apexFetch('/downloads', {
      method: 'POST',
      body: JSON.stringify({
        document_id: documentId,
        timestamp: new Date().toISOString(),
      }),
    });
    
    // Increment counter on document
    await apexFetch(`/documents/${documentId}/increment-download`, {
      method: 'PUT',
    });
  },

  // ==================
  // COMMENTS
  // ==================

  async getComments(documentId?: string): Promise<Comment[]> {
    const endpoint = documentId 
      ? `/comments?document_id=${documentId}` 
      : '/comments';
    
    const data = await apexFetch<{ items: any[] }>(endpoint);
    return data.items.map(comment => ({
      id: String(comment.id),
      documentId: String(comment.document_id),
      author: comment.author,
      content: comment.content,
      createdAt: toISODate(comment.created_at),
    }));
  },

  async addComment(documentId: string, author: string, content: string): Promise<Comment> {
    const result = await apexFetch<any>('/comments', {
      method: 'POST',
      body: JSON.stringify({
        document_id: documentId,
        author,
        content,
        created_at: new Date().toISOString(),
      }),
    });
    
    return {
      id: String(result.id),
      documentId: String(result.document_id),
      author: result.author,
      content: result.content,
      createdAt: toISODate(result.created_at),
    };
  },

  async deleteComment(commentId: string): Promise<void> {
    await apexFetch(`/comments/${commentId}`, {
      method: 'DELETE',
    });
  },

  // ==================
  // ANALYTICS
  // ==================

  async getAnalytics(timeRange: TimeRange = 'month'): Promise<Analytics> {
    // Get analytics data from Oracle
    const data = await apexFetch<any>(`/analytics?time_range=${timeRange}`);
    
    return {
      totalDocuments: data.total_documents || 0,
      totalDownloads: data.total_downloads || 0,
      uniqueCourses: data.unique_courses || 0,
      uniqueProfessors: data.unique_professors || 0,
      uploadsOverTime: (data.uploads_over_time || []).map((item: any) => ({
        month: item.period,
        uploads: item.count,
      })),
      courseDistribution: (data.course_distribution || []).map((item: any) => ({
        course: item.course,
        documents: item.count,
      })),
      documentTypes: (data.document_types || []).map((item: any, index: number) => {
        const colors = [
          "hsl(270, 65%, 45%)",
          "hsl(280, 70%, 50%)",
          "hsl(260, 60%, 55%)",
          "hsl(290, 55%, 50%)",
          "hsl(250, 65%, 50%)",
        ];
        return {
          name: item.file_type,
          value: item.count,
          fill: colors[index % colors.length],
        };
      }),
      topProfessors: (data.top_professors || []).map((item: any) => ({
        name: item.professor,
        course: item.course,
        documents: item.count,
      })),
      downloadTrends: (data.download_trends || []).map((item: any) => ({
        day: item.period,
        downloads: item.count,
      })),
      recentActivity: (data.recent_activity || []).map((item: any) => ({
        type: item.activity_type as 'upload' | 'download',
        document: item.document_title,
        time: item.time_ago,
        timestamp: new Date(item.timestamp),
      })),
      timeRange,
    };
  },

  // ==================
  // DOWNLOAD EVENTS
  // ==================

  async getDownloadEvents(): Promise<DownloadEvent[]> {
    const data = await apexFetch<{ items: any[] }>('/downloads');
    return data.items.map(event => ({
      documentId: String(event.document_id),
      timestamp: toISODate(event.timestamp),
    }));
  },
};
