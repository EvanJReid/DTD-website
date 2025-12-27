import { useState, useEffect, useCallback } from 'react';
import { 
  Document, 
  Comment,
  getDocuments, 
  addDocument, 
  incrementDownload, 
  getAnalytics,
  getComments,
  addComment as addCommentToDb,
  deleteComment as deleteCommentFromDb,
} from '@/lib/database';

export const useDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([]);

  const refresh = useCallback(() => {
    setDocuments(getDocuments());
  }, []);

  useEffect(() => {
    refresh();
    
    // Listen for storage changes from other tabs
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'studyhub_documents') {
        refresh();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
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

export const useAnalytics = () => {
  const [analytics, setAnalytics] = useState(getAnalytics());

  const refresh = useCallback(() => {
    setAnalytics(getAnalytics());
  }, []);

  useEffect(() => {
    refresh();
    
    const handleStorage = () => {
      refresh();
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [refresh]);

  return { analytics, refresh };
};

export const useComments = (documentId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);

  const refresh = useCallback(() => {
    setComments(getComments(documentId));
  }, [documentId]);

  useEffect(() => {
    refresh();
    
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'studyhub_comments') {
        refresh();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
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
