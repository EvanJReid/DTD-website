import { useState, useEffect, useCallback } from 'react';
import { api, STORAGE_KEYS, Document, Comment, TimeRange, Analytics } from '@/lib/api';

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
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
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
