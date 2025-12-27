import { useState } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Stats } from "@/components/Stats";
import { DocumentGrid } from "@/components/DocumentGrid";
import { UploadModal, UploadData } from "@/components/UploadModal";
import { useDocuments } from "@/hooks/useDatabase";
import { Document } from "@/lib/database";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const { documents, uploadDocument, trackDownload } = useDocuments();

  const handleUpload = (data: UploadData) => {
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

    uploadDocument({
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

      {/* Footer */}
      <footer className="border-t border-border py-12 mt-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 Delta Tau Delta. Committed to Lives of Excellence.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
