// localStorage implementation of the Database API
// This can be swapped for Oracle REST API by implementing the same interface

import { Document, DownloadEvent, Comment, TimeRange, Analytics, DatabaseAPI, Folder } from './types';

const DOCUMENTS_KEY = 'dtd_documents';
const DOWNLOADS_KEY = 'dtd_downloads';
const COMMENTS_KEY = 'dtd_comments';
const FOLDERS_KEY = 'dtd_folders';

// Helper to safely parse JSON from localStorage
const safeGetItem = <T>(key: string, defaultValue: T): T => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

// Helper to safely save to localStorage
const safeSetItem = (key: string, value: unknown): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent('localStorageUpdate', { detail: { key } }));
    return true;
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
    return false;
  }
};

// Analytics helper functions
const getDateRangeStart = (range: TimeRange): Date => {
  const now = new Date();
  switch (range) {
    case 'week':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    case 'month':
      return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    case 'year':
      return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  }
};

const filterByTimeRange = <T extends { uploadedAt?: string; timestamp?: string }>(
  items: T[],
  range: TimeRange,
  dateField: 'uploadedAt' | 'timestamp' = 'uploadedAt'
): T[] => {
  const startDate = getDateRangeStart(range);
  return items.filter(item => {
    const dateStr = dateField === 'uploadedAt' 
      ? (item as any).uploadedAt 
      : (item as any).timestamp;
    if (!dateStr) return false;
    return new Date(dateStr) >= startDate;
  });
};

const getUploadsOverTime = (documents: Document[], timeRange: TimeRange) => {
  const now = new Date();
  
  if (timeRange === 'week') {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];
      const count = documents.filter(d => {
        const docDate = new Date(d.uploadedAt);
        return docDate.toDateString() === date.toDateString();
      }).length;
      result.push({ month: dayName, uploads: count });
    }
    return result;
  } else if (timeRange === 'month') {
    const result = [];
    for (let i = 3; i >= 0; i--) {
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() - (i * 7));
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekStart.getDate() - 6);
      const label = `Week ${4 - i}`;
      const count = documents.filter(d => {
        const docDate = new Date(d.uploadedAt);
        return docDate >= weekStart && docDate <= weekEnd;
      }).length;
      result.push({ month: label, uploads: count });
    }
    return result;
  } else {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const result = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = months[date.getMonth()];
      const count = documents.filter(d => {
        const docDate = new Date(d.uploadedAt);
        return docDate.getMonth() === date.getMonth() && docDate.getFullYear() === date.getFullYear();
      }).length;
      result.push({ month: monthName, uploads: count });
    }
    return result;
  }
};

const getCourseDistribution = (documents: Document[]) => {
  const courseMap: Record<string, number> = {};
  documents.forEach(d => {
    courseMap[d.course] = (courseMap[d.course] || 0) + 1;
  });
  
  return Object.entries(courseMap)
    .map(([course, documents]) => ({ course, documents }))
    .sort((a, b) => b.documents - a.documents)
    .slice(0, 5);
};

const getDocumentTypeDistribution = (documents: Document[]) => {
  const typeMap: Record<string, number> = {};
  documents.forEach(d => {
    typeMap[d.fileType] = (typeMap[d.fileType] || 0) + 1;
  });
  
  const colors: Record<string, string> = {
    pdf: 'hsl(0, 84%, 60%)',
    excel: 'hsl(142, 71%, 45%)',
    powerpoint: 'hsl(25, 95%, 53%)',
    python: 'hsl(207, 90%, 54%)',
    java: 'hsl(262, 83%, 58%)',
    other: 'hsl(215, 16%, 47%)',
  };
  
  return Object.entries(typeMap).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    fill: colors[name] || colors.other,
  }));
};

const getTopProfessors = (documents: Document[]) => {
  const profMap: Record<string, { courses: Set<string>; docs: number }> = {};
  
  documents.forEach(d => {
    if (!profMap[d.professor]) {
      profMap[d.professor] = { courses: new Set(), docs: 0 };
    }
    profMap[d.professor].courses.add(d.course);
    profMap[d.professor].docs += 1;
  });
  
  return Object.entries(profMap)
    .map(([name, data]) => ({
      name,
      course: Array.from(data.courses).join(', '),
      documents: data.docs,
    }))
    .sort((a, b) => b.documents - a.documents)
    .slice(0, 5);
};

const getDownloadTrends = (downloads: DownloadEvent[], timeRange: TimeRange) => {
  const now = new Date();
  
  if (timeRange === 'week') {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];
      const count = downloads.filter(d => {
        const dlDate = new Date(d.timestamp);
        return dlDate.toDateString() === date.toDateString();
      }).length;
      result.push({ day: dayName, downloads: count });
    }
    return result;
  } else if (timeRange === 'month') {
    const result = [];
    for (let i = 3; i >= 0; i--) {
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() - (i * 7));
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekStart.getDate() - 6);
      const label = `Week ${4 - i}`;
      const count = downloads.filter(d => {
        const dlDate = new Date(d.timestamp);
        return dlDate >= weekStart && dlDate <= weekEnd;
      }).length;
      result.push({ day: label, downloads: count });
    }
    return result;
  } else {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const result = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = months[date.getMonth()];
      const count = downloads.filter(d => {
        const dlDate = new Date(d.timestamp);
        return dlDate.getMonth() === date.getMonth() && dlDate.getFullYear() === date.getFullYear();
      }).length;
      result.push({ day: monthName, downloads: count });
    }
    return result;
  }
};

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const getRecentActivity = (documents: Document[], downloads: DownloadEvent[]) => {
  const activities: { type: 'upload' | 'download'; document: string; time: string; timestamp: Date }[] = [];
  
  documents.slice(0, 10).forEach(d => {
    activities.push({
      type: 'upload',
      document: d.title,
      time: formatTimeAgo(new Date(d.uploadedAt)),
      timestamp: new Date(d.uploadedAt),
    });
  });
  
  downloads.slice(-10).forEach(dl => {
    const doc = documents.find(d => d.id === dl.documentId);
    if (doc) {
      activities.push({
        type: 'download',
        document: doc.title,
        time: formatTimeAgo(new Date(dl.timestamp)),
        timestamp: new Date(dl.timestamp),
      });
    }
  });
  
  return activities
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 5);
};

// localStorage implementation of DatabaseAPI
export const localStorageAPI: DatabaseAPI = {
  async getDocuments(): Promise<Document[]> {
    return safeGetItem<Document[]>(DOCUMENTS_KEY, []);
  },

  async addDocument(doc: Omit<Document, 'id' | 'downloads'>): Promise<Document> {
    const documents = safeGetItem<Document[]>(DOCUMENTS_KEY, []);
    const newDoc: Document = {
      ...doc,
      id: crypto.randomUUID(),
      downloads: 0,
    };
    documents.unshift(newDoc);
    safeSetItem(DOCUMENTS_KEY, documents);
    return newDoc;
  },

  async incrementDownload(documentId: string): Promise<void> {
    const documents = safeGetItem<Document[]>(DOCUMENTS_KEY, []);
    const doc = documents.find(d => d.id === documentId);
    if (doc) {
      doc.downloads += 1;
      safeSetItem(DOCUMENTS_KEY, documents);
      
      const downloads = safeGetItem<DownloadEvent[]>(DOWNLOADS_KEY, []);
      downloads.push({ documentId, timestamp: new Date().toISOString() });
      safeSetItem(DOWNLOADS_KEY, downloads);
    }
  },

  async getDownloadEvents(): Promise<DownloadEvent[]> {
    return safeGetItem<DownloadEvent[]>(DOWNLOADS_KEY, []);
  },

  async getComments(documentId?: string): Promise<Comment[]> {
    const comments = safeGetItem<Comment[]>(COMMENTS_KEY, []);
    if (documentId) {
      return comments.filter(c => c.documentId === documentId);
    }
    return comments;
  },

  async addComment(documentId: string, author: string, content: string): Promise<Comment> {
    const comments = safeGetItem<Comment[]>(COMMENTS_KEY, []);
    const newComment: Comment = {
      id: crypto.randomUUID(),
      documentId,
      author: author.trim() || 'Anonymous',
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };
    comments.unshift(newComment);
    safeSetItem(COMMENTS_KEY, comments);
    return newComment;
  },

  async deleteComment(commentId: string): Promise<void> {
    const comments = safeGetItem<Comment[]>(COMMENTS_KEY, []);
    const filtered = comments.filter(c => c.id !== commentId);
    safeSetItem(COMMENTS_KEY, filtered);
  },

  async getAnalytics(timeRange: TimeRange = 'month'): Promise<Analytics> {
    const allDocuments = safeGetItem<Document[]>(DOCUMENTS_KEY, []);
    const allDownloads = safeGetItem<DownloadEvent[]>(DOWNLOADS_KEY, []);
    
    const documents = filterByTimeRange(allDocuments, timeRange, 'uploadedAt');
    const downloads = filterByTimeRange(allDownloads, timeRange, 'timestamp');
    
    return {
      totalDocuments: documents.length,
      totalDownloads: documents.reduce((sum, d) => sum + d.downloads, 0),
      uniqueCourses: new Set(documents.map(d => d.course)).size,
      uniqueProfessors: new Set(documents.map(d => d.professor)).size,
      uploadsOverTime: getUploadsOverTime(documents, timeRange),
      courseDistribution: getCourseDistribution(documents),
      documentTypes: getDocumentTypeDistribution(documents),
      topProfessors: getTopProfessors(documents),
      downloadTrends: getDownloadTrends(downloads, timeRange),
      recentActivity: getRecentActivity(documents, downloads),
      timeRange,
    };
  },

  // ==================
  // FOLDERS
  // ==================

  async getFolders(): Promise<Folder[]> {
    return safeGetItem<Folder[]>(FOLDERS_KEY, []);
  },

  async getFolder(folderId: string): Promise<Folder | null> {
    const folders = safeGetItem<Folder[]>(FOLDERS_KEY, []);
    return folders.find(f => f.id === folderId) || null;
  },

  async addFolder(folder: Omit<Folder, 'id' | 'documentCount' | 'createdAt'>): Promise<Folder> {
    const folders = safeGetItem<Folder[]>(FOLDERS_KEY, []);
    const newFolder: Folder = {
      ...folder,
      id: crypto.randomUUID(),
      documentCount: 0,
      createdAt: new Date().toISOString(),
    };
    folders.unshift(newFolder);
    safeSetItem(FOLDERS_KEY, folders);
    return newFolder;
  },

  async deleteFolder(folderId: string): Promise<void> {
    const folders = safeGetItem<Folder[]>(FOLDERS_KEY, []);
    const filtered = folders.filter(f => f.id !== folderId);
    safeSetItem(FOLDERS_KEY, filtered);
    
    // Also remove documents in this folder
    const documents = safeGetItem<Document[]>(DOCUMENTS_KEY, []);
    const filteredDocs = documents.filter(d => d.folderId !== folderId);
    safeSetItem(DOCUMENTS_KEY, filteredDocs);
  },

  async getFolderDocuments(folderId: string): Promise<Document[]> {
    const documents = safeGetItem<Document[]>(DOCUMENTS_KEY, []);
    return documents.filter(d => d.folderId === folderId);
  },

  async addDocumentsToFolder(
    folderId: string,
    docs: Omit<Document, 'id' | 'downloads' | 'folderId'>[]
  ): Promise<Document[]> {
    const documents = safeGetItem<Document[]>(DOCUMENTS_KEY, []);
    const folders = safeGetItem<Folder[]>(FOLDERS_KEY, []);
    
    const newDocs: Document[] = docs.map(doc => ({
      ...doc,
      id: crypto.randomUUID(),
      downloads: 0,
      folderId,
    }));
    
    // Add documents
    documents.unshift(...newDocs);
    safeSetItem(DOCUMENTS_KEY, documents);
    
    // Update folder document count
    const folder = folders.find(f => f.id === folderId);
    if (folder) {
      folder.documentCount += newDocs.length;
      safeSetItem(FOLDERS_KEY, folders);
    }
    
    return newDocs;
  },
};
