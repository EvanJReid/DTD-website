import { useState } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Stats } from "@/components/Stats";
import { DocumentGrid } from "@/components/DocumentGrid";
import { UploadModal, UploadData } from "@/components/UploadModal";
import { CreateFolderModal, FolderUploadData } from "@/components/CreateFolderModal";
import { FolderCard } from "@/components/FolderCard";
import { useDocuments, useFolders } from "@/hooks/useDatabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Folder } from "lucide-react";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isFolderOpen, setIsFolderOpen] = useState(false);
  const { documents, trackDownload, refresh } = useDocuments();
  const { folders, createFolder } = useFolders();

  const handleUpload = async (data: UploadData) => {
    if (!data.file) throw new Error("No file selected");

    const BASE_URL = import.meta.env.VITE_ORACLE_APEX_URL || 'https://129-213-123-67.sslip.io/api';
    const token = localStorage.getItem('dtd_token');

    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('title', data.title);
    formData.append('course', data.course);
    formData.append('professor', data.professor);

    const response = await fetch(`${BASE_URL}/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 401 || status === 403) {
        throw new Error(`Sign in required (${status}). Please sign in to upload documents.`);
      }
      throw new Error(`Upload failed: ${status} ${response.statusText}`);
    }

    await refresh();
  };

  const handleCreateFolder = async (data: FolderUploadData) => {
    await createFolder(data);
  };

  // Filter folders by search
  const filteredFolders = folders.filter((folder) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      folder.name.toLowerCase().includes(query) ||
      folder.course.toLowerCase().includes(query) ||
      folder.professor.toLowerCase().includes(query) ||
      folder.description.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onUploadClick={() => setIsUploadOpen(true)} 
        onFolderClick={() => setIsFolderOpen(true)}
      />
      <Hero searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <Stats />
      
      {/* Content with tabs */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <Tabs defaultValue="documents" className="w-full">
            <div className="flex items-center justify-between mb-8">
              <TabsList className="bg-muted/50">
                <TabsTrigger value="documents" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Documents
                </TabsTrigger>
                <TabsTrigger value="collections" className="gap-2">
                  <Folder className="h-4 w-4" />
                  Collections
                  {folders.length > 0 && (
                    <span className="ml-1 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                      {folders.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="documents" className="mt-0">
              <DocumentGrid 
                documents={documents.filter(d => !d.folderId)} 
                searchQuery={searchQuery} 
                onDownload={trackDownload}
              />
            </TabsContent>

            <TabsContent value="collections" className="mt-0">
              {filteredFolders.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredFolders.map((folder, index) => (
                    <div
                      key={folder.id}
                      className="animate-slide-up"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <FolderCard folder={folder} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <Folder className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">No collections yet</h3>
                  <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                    Create a collection to organize related documents like lab reports or study guides.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <UploadModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
        onUpload={handleUpload}
      />
      <CreateFolderModal
        isOpen={isFolderOpen}
        onClose={() => setIsFolderOpen(false)}
        onCreateFolder={handleCreateFolder}
      />
    </div>
  );
};

export default Index;
