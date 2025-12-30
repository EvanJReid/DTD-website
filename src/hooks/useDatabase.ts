import { useState, useEffect, useCallback } from 'react';
import { api, STORAGE_KEYS, Document, Comment, TimeRange, Analytics, Folder } from '@/lib/api';

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
    // Create the folder
    const newFolder = await api.addFolder({
      name: data.name,
      description: data.description,
      course: data.course,
      professor: data.professor,
    });

    // Add documents to folder
    if (data.files.length > 0) {
      const typeMapping: Record<string, Document['fileType']> = {
        pdf: 'pdf',
        xlsx: 'excel',
        xls: 'excel',
        py: 'python',
        java: 'java',
        pptx: 'powerpoint',
        ppt: 'powerpoint',
      };

      const docs = data.files.map(file => {
        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        return {
          title: file.name.replace(/\.[^/.]+$/, ""),
          course: data.course,
          professor: data.professor,
          fileName: file.name,
          fileType: typeMapping[ext] || 'other' as Document['fileType'],
          uploadedAt: new Date().toISOString(),
        };
      });

      await api.addDocumentsToFolder(newFolder.id, docs);
      newFolder.documentCount = docs.length;
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
