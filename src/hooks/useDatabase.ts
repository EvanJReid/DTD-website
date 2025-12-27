import { useState, useEffect, useCallback } from 'react';
import { 
  Document, 
  Comment,
  TimeRange,
  getDocuments, 
  addDocument, 
  incrementDownload, 
  getAnalytics,
  getComments,
  addComment as addCommentToDb,
  deleteComment as deleteCommentFromDb,
} from '@/lib/database';

export const useDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>(() => getDocuments());

  const refresh = useCallback(() => {
    setDocuments(getDocuments());
  }, []);

  useEffect(() => {
    // Listen for storage changes from other tabs
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'dtd_documents') {
        refresh();
      }
    };
    
    // Listen for same-tab updates via custom event
    const handleLocalUpdate = (e: CustomEvent<{ key: string }>) => {
      if (e.detail.key === 'dtd_documents') {
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

  const uploadDocument = useCallback((data: {
    title: string;
    course: string;
    professor: string;
    fileName: string;
    fileType: Document['fileType'];
  }) => {
    const newDoc = addDocument({
      ...data,
      uploadedAt: new Date().toISOString(),
    });
    setDocuments(prev => [newDoc, ...prev]);
    return newDoc;
  }, []);

  const trackDownload = useCallback((documentId: string) => {
    incrementDownload(documentId);
    refresh();
  }, [refresh]);

  return { documents, uploadDocument, trackDownload, refresh };
};

export const useAnalytics = (timeRange: TimeRange = 'month') => {
  const [analytics, setAnalytics] = useState(() => getAnalytics(timeRange));

  const refresh = useCallback(() => {
    setAnalytics(getAnalytics(timeRange));
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

  return { analytics, refresh };
};

export const useComments = (documentId: string) => {
  const [comments, setComments] = useState<Comment[]>(() => getComments(documentId));

  const refresh = useCallback(() => {
    setComments(getComments(documentId));
  }, [documentId]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'dtd_comments') {
        refresh();
      }
    };
    
    const handleLocalUpdate = (e: CustomEvent<{ key: string }>) => {
      if (e.detail.key === 'dtd_comments') {
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

  const addComment = useCallback((author: string, content: string) => {
    const newComment = addCommentToDb(documentId, author, content);
    setComments(prev => [newComment, ...prev]);
    return newComment;
  }, [documentId]);

  const deleteComment = useCallback((commentId: string) => {
    deleteCommentFromDb(commentId);
    refresh();
  }, [refresh]);

  return { comments, addComment, deleteComment, refresh };
};
