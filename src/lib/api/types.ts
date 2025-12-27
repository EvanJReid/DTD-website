// Shared types for the API layer
// These types are used by both localStorage and future Oracle implementations

export interface Document {
  id: string;
  title: string;
  course: string;
  professor: string;
  fileType: 'pdf' | 'excel' | 'python' | 'java' | 'powerpoint' | 'other';
  fileName: string;
  uploadedAt: string;
  downloads: number;
}

export interface DownloadEvent {
  documentId: string;
  timestamp: string;
}

export interface Comment {
  id: string;
  documentId: string;
  author: string;
  content: string;
  createdAt: string;
}

export type TimeRange = 'week' | 'month' | 'year';

export interface Analytics {
  totalDocuments: number;
  totalDownloads: number;
  uniqueCourses: number;
  uniqueProfessors: number;
  uploadsOverTime: { month: string; uploads: number }[];
  courseDistribution: { course: string; documents: number }[];
  documentTypes: { name: string; value: number; fill: string }[];
  topProfessors: { name: string; course: string; documents: number }[];
  downloadTrends: { day: string; downloads: number }[];
  recentActivity: { type: 'upload' | 'download'; document: string; time: string; timestamp: Date }[];
  timeRange: TimeRange;
}

// API interface - implement this for different backends
export interface DatabaseAPI {
  // Documents
  getDocuments(): Promise<Document[]>;
  addDocument(doc: Omit<Document, 'id' | 'downloads'>): Promise<Document>;
  incrementDownload(documentId: string): Promise<void>;
  
  // Comments
  getComments(documentId?: string): Promise<Comment[]>;
  addComment(documentId: string, author: string, content: string): Promise<Comment>;
  deleteComment(commentId: string): Promise<void>;
  
  // Analytics
  getAnalytics(timeRange?: TimeRange): Promise<Analytics>;
  
  // Download events (for analytics)
  getDownloadEvents(): Promise<DownloadEvent[]>;
}
