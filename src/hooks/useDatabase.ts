import { useState, useEffect, useCallback } from 'react';
import { 
  Document, 
  getDocuments, 
  addDocument, 
  incrementDownload, 
  getAnalytics 
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
