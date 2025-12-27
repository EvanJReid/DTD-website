import { useState } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Stats } from "@/components/Stats";
import { DocumentGrid } from "@/components/DocumentGrid";
import { UploadModal, UploadData } from "@/components/UploadModal";
import { useDocuments } from "@/hooks/useDatabase";
import { Document } from "@/lib/api";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const { documents, uploadDocument, trackDownload } = useDocuments();

  const handleUpload = async (data: UploadData) => {
    const fileExt = data.file?.name.split('.').pop()?.toLowerCase() || 'pdf';
    const typeMapping: Record<string, Document['fileType']> = {
      pdf: 'pdf',
      xlsx: 'excel',
      xls: 'excel',
      py: 'python',
      java: 'java',
      pptx: 'powerpoint',
      ppt: 'powerpoint',
    };

    await uploadDocument({
      title: data.title,
      course: data.course,
      professor: data.professor,
      fileName: data.file?.name || 'document',
      fileType: typeMapping[fileExt] || 'other',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onUploadClick={() => setIsUploadOpen(true)} />
      <Hero searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <Stats />
      <DocumentGrid 
        documents={documents} 
        searchQuery={searchQuery} 
        onDownload={trackDownload}
      />
      <UploadModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
        onUpload={handleUpload}
      />
    </div>
  );
};

export default Index;
