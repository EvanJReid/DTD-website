// Local database using localStorage for persistence

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

const DOCUMENTS_KEY = 'studyhub_documents';
const DOWNLOADS_KEY = 'studyhub_downloads';

// Documents CRUD
export const getDocuments = (): Document[] => {
  const data = localStorage.getItem(DOCUMENTS_KEY);
  return data ? JSON.parse(data) : [];
};

export const addDocument = (doc: Omit<Document, 'id' | 'downloads'>): Document => {
  const documents = getDocuments();
  const newDoc: Document = {
    ...doc,
    id: crypto.randomUUID(),
    downloads: 0,
  };
  documents.unshift(newDoc);
  localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(documents));
  return newDoc;
};

export const incrementDownload = (documentId: string): void => {
  const documents = getDocuments();
  const doc = documents.find(d => d.id === documentId);
  if (doc) {
    doc.downloads += 1;
    localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(documents));
    
    // Track download event
    const downloads = getDownloadEvents();
    downloads.push({ documentId, timestamp: new Date().toISOString() });
    localStorage.setItem(DOWNLOADS_KEY, JSON.stringify(downloads));
  }
};

export const getDownloadEvents = (): DownloadEvent[] => {
  const data = localStorage.getItem(DOWNLOADS_KEY);
  return data ? JSON.parse(data) : [];
};

// Analytics
export const getAnalytics = () => {
  const documents = getDocuments();
  const downloads = getDownloadEvents();
  
  const totalDocuments = documents.length;
  const totalDownloads = documents.reduce((sum, d) => sum + d.downloads, 0);
  const uniqueCourses = new Set(documents.map(d => d.course)).size;
  const uniqueProfessors = new Set(documents.map(d => d.professor)).size;
  
  // Uploads over time (last 6 months)
  const uploadsOverTime = getUploadsOverTime(documents);
  
  // Course distribution
  const courseDistribution = getCourseDistribution(documents);
  
  // Document types
  const documentTypes = getDocumentTypeDistribution(documents);
  
  // Top professors
  const topProfessors = getTopProfessors(documents);
  
  // Download trends (last 7 days)
  const downloadTrends = getDownloadTrends(downloads);
  
  // Recent activity
  const recentActivity = getRecentActivity(documents, downloads);
  
  return {
    totalDocuments,
    totalDownloads,
    uniqueCourses,
    uniqueProfessors,
    uploadsOverTime,
    courseDistribution,
    documentTypes,
    topProfessors,
    downloadTrends,
    recentActivity,
  };
};

const getUploadsOverTime = (documents: Document[]) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const result = [];
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = months[date.getMonth()];
    const count = documents.filter(d => {
      const docDate = new Date(d.uploadedAt);
      return docDate.getMonth() === date.getMonth() && docDate.getFullYear() === date.getFullYear();
    }).length;
    result.push({ month: monthName, uploads: count });
  }
  
  return result;
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

const getDownloadTrends = (downloads: DownloadEvent[]) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const now = new Date();
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
