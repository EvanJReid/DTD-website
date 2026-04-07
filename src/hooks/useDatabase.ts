import { useState, useEffect, useCallback } from 'react';
import { api, STORAGE_KEYS, Document, Comment, TimeRange, Analytics, Folder } from '@/lib/api';
import type { ProfessorRating, CoopEntry } from '@/lib/api/types';

const BASE_URL = import.meta.env.VITE_ORACLE_APEX_URL || 'https://129-213-123-67.sslip.io/api';

export const useDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const docs = await api.getDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    
    // Listen for storage changes (localStorage specific - remove for Oracle)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.documents) {
        refresh();
      }
    };
    
    const handleLocalUpdate = (e: CustomEvent<{ key: string }>) => {
      if (e.detail.key === STORAGE_KEYS.documents) {
        refresh();
      }
    };
    
    window.addEventListener('storage', handleStorage);
    window.addEventListener('localStorageUpdate', handleLocalUpdate as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('localStorageUpdate', handleLocalUpdate as EventListener);
    };
  }, [refresh]);

  const uploadDocument = useCallback(async (data: {
    title: string;
    course: string;
    professor: string;
    fileName: string;
    fileType: Document['fileType'];
  }) => {
    const newDoc = await api.addDocument({
      ...data,
      uploadedAt: new Date().toISOString(),
    });
    setDocuments(prev => [newDoc, ...prev]);
    return newDoc;
  }, []);

  const trackDownload = useCallback(async (documentId: string) => {
    await api.incrementDownload(documentId);
    refresh();
  }, [refresh]);

  return { documents, loading, uploadDocument, trackDownload, refresh };
};

export const useAnalytics = (timeRange: TimeRange = 'month') => {
  const [analytics, setAnalytics] = useState<Analytics>({
    totalDocuments: 0,
    totalDownloads: 0,
    uniqueCourses: 0,
    uniqueProfessors: 0,
    uploadsOverTime: [],
    courseDistribution: [],
    documentTypes: [],
    topProfessors: [],
    downloadTrends: [],
    recentActivity: [],
    timeRange,
  });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await api.getAnalytics(timeRange);
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    refresh();
    
    const handleStorage = () => refresh();
    const handleLocalUpdate = () => refresh();
    
    window.addEventListener('storage', handleStorage);
    window.addEventListener('localStorageUpdate', handleLocalUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('localStorageUpdate', handleLocalUpdate);
    };
  }, [refresh]);

  return { analytics, loading, refresh };
};

export const useComments = (documentId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await api.getComments(documentId);
      setComments(data);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    refresh();
    
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.comments) {
        refresh();
      }
    };
    
    const handleLocalUpdate = (e: CustomEvent<{ key: string }>) => {
      if (e.detail.key === STORAGE_KEYS.comments) {
        refresh();
      }
    };
    
    window.addEventListener('storage', handleStorage);
    window.addEventListener('localStorageUpdate', handleLocalUpdate as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('localStorageUpdate', handleLocalUpdate as EventListener);
    };
  }, [refresh]);

  const addComment = useCallback(async (author: string, content: string) => {
    const newComment = await api.addComment(documentId, author, content);
    setComments(prev => [newComment, ...prev]);
    return newComment;
  }, [documentId]);

  const deleteComment = useCallback(async (commentId: string) => {
    await api.deleteComment(commentId);
    refresh();
  }, [refresh]);

  return { comments, loading, addComment, deleteComment, refresh };
};

// ==================
// FOLDER HOOKS
// ==================

export const useFolders = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await api.getFolders();
      setFolders(data);
    } catch (error) {
      console.error('Failed to fetch folders:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    
    const handleLocalUpdate = () => refresh();
    window.addEventListener('localStorageUpdate', handleLocalUpdate);
    
    return () => {
      window.removeEventListener('localStorageUpdate', handleLocalUpdate);
    };
  }, [refresh]);

  const createFolder = useCallback(async (data: {
    name: string;
    description: string;
    course: string;
    professor: string;
    files: File[];
  }) => {
    // Create the folder metadata
    const newFolder = await api.addFolder({
      name: data.name,
      description: data.description,
      course: data.course,
      professor: data.professor,
    });

    // Upload each file to the backend with the folder id
    if (data.files.length > 0) {
      const token = localStorage.getItem('dtd_token');
      await Promise.all(
        data.files.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('title', file.name.replace(/\.[^/.]+$/, ''));
          formData.append('course', data.course);
          formData.append('professor', data.professor);
          formData.append('folderId', newFolder.id);
          const res = await fetch(`${BASE_URL}/upload`, {
            method: 'POST',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: formData,
          });
          if (!res.ok) {
            const status = res.status;
            if (status === 401 || status === 403) {
              throw new Error(`Sign in required (${status}). Please sign in to create collections.`);
            }
            throw new Error(`Upload failed: ${status} ${res.statusText}`);
          }
        })
      );
      newFolder.documentCount = data.files.length;
    }

    setFolders(prev => [newFolder, ...prev]);
    return newFolder;
  }, []);

  const deleteFolder = useCallback(async (folderId: string) => {
    await api.deleteFolder(folderId);
    setFolders(prev => prev.filter(f => f.id !== folderId));
  }, []);

  return { folders, loading, createFolder, deleteFolder, refresh };
};

export const useFolder = (folderId: string) => {
  const [folder, setFolder] = useState<Folder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFolder = async () => {
      try {
        const data = await api.getFolder(folderId);
        setFolder(data);
      } catch (error) {
        console.error('Failed to fetch folder:', error);
      } finally {
        setLoading(false);
      }
    };

    if (folderId) {
      fetchFolder();
    }
  }, [folderId]);

  return { folder, loading };
};

export const useFolderDocuments = (folderId: string) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await api.getFolderDocuments(folderId);
      setDocuments(data);
    } catch (error) {
      console.error('Failed to fetch folder documents:', error);
    } finally {
      setLoading(false);
    }
  }, [folderId]);

  useEffect(() => {
    if (folderId) {
      refresh();
    }
  }, [folderId, refresh]);

  const trackDownload = useCallback(async (documentId: string) => {
    await api.incrementDownload(documentId);
    refresh();
  }, [refresh]);

  return { documents, loading, trackDownload, refresh };
};

// ==================
// PROFESSOR RATINGS (localStorage)
// Key: dtd_prof_ratings -> { [profName]: { [userEmail]: number } }
// ==================

const RATINGS_KEY = 'dtd_prof_ratings';

function loadRatings(): Record<string, Record<string, number>> {
  try {
    return JSON.parse(localStorage.getItem(RATINGS_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveRatings(data: Record<string, Record<string, number>>) {
  localStorage.setItem(RATINGS_KEY, JSON.stringify(data));
}

export function useProfessorRatings(professorName?: string) {
  const [ratings, setRatings] = useState<Record<string, Record<string, number>>>(loadRatings);
  const userEmail = localStorage.getItem('dtd_email') || '';

  const getProfessorRating = useCallback((name: string): ProfessorRating => {
    const profRatings = ratings[name] || {};
    const values = Object.values(profRatings);
    const averageRating = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    return {
      professorName: name,
      averageRating,
      ratingCount: values.length,
      userRating: userEmail ? profRatings[userEmail] : undefined,
    };
  }, [ratings, userEmail]);

  const rateProf = useCallback((name: string, rating: number) => {
    if (!userEmail) return;
    const updated = { ...loadRatings() };
    if (!updated[name]) updated[name] = {};
    updated[name][userEmail] = rating;
    saveRatings(updated);
    setRatings({ ...updated });
  }, [userEmail]);

  const profRating = professorName ? getProfessorRating(professorName) : null;

  return { profRating, getProfessorRating, rateProf };
}

// ==================
// CO-OP DATABASE (localStorage)
// Key: dtd_coops -> CoopEntry[]
// ==================

const COOPS_KEY = 'dtd_coops';

function loadCoops(): CoopEntry[] {
  try {
    return JSON.parse(localStorage.getItem(COOPS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveCoops(data: CoopEntry[]) {
  localStorage.setItem(COOPS_KEY, JSON.stringify(data));
}

export function useCoops() {
  const [coops, setCoops] = useState<CoopEntry[]>(loadCoops);

  const addCoop = useCallback((entry: Omit<CoopEntry, 'id' | 'addedAt' | 'addedBy'>) => {
    const userEmail = localStorage.getItem('dtd_email') || '';
    const newEntry: CoopEntry = {
      ...entry,
      id: Date.now().toString(),
      addedAt: new Date().toISOString(),
      addedBy: userEmail || undefined,
    };
    const updated = [newEntry, ...loadCoops()];
    saveCoops(updated);
    setCoops(updated);
    return newEntry;
  }, []);

  const updateCoop = useCallback((id: string, updates: Partial<Omit<CoopEntry, 'id' | 'addedAt' | 'addedBy'>>) => {
    const updated = loadCoops().map(c => c.id === id ? { ...c, ...updates } : c);
    saveCoops(updated);
    setCoops(updated);
  }, []);

  const deleteCoop = useCallback((id: string) => {
    const updated = loadCoops().filter(c => c.id !== id);
    saveCoops(updated);
    setCoops(updated);
  }, []);

  // Group by company, sorted by count desc
  const coopsByCompany = coops.reduce((acc, c) => {
    if (!acc[c.company]) acc[c.company] = [];
    acc[c.company].push(c);
    return acc;
  }, {} as Record<string, CoopEntry[]>);

  const sortedCompanies = Object.entries(coopsByCompany)
    .sort(([, a], [, b]) => b.length - a.length)
    .map(([company, entries]) => ({ company, coops: entries, count: entries.length }));

  return { coops, coopsByCompany: sortedCompanies, addCoop, updateCoop, deleteCoop };
}
