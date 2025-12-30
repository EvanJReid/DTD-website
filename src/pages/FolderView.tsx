import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Folder, FileText, Calendar, User, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DocumentCard } from "@/components/DocumentCard";
import { useFolder, useFolderDocuments } from "@/hooks/useDatabase";

const formatDate = (isoString: string) => {
  return new Date(isoString).toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

export default function FolderView() {
  const { folderId } = useParams<{ folderId: string }>();
  const navigate = useNavigate();
  const { folder, loading: folderLoading } = useFolder(folderId || "");
  const { documents, loading: docsLoading, trackDownload } = useFolderDocuments(folderId || "");

  if (folderLoading || docsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading collection...</p>
        </div>
      </div>
    );
  }

  if (!folder) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Folder className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Collection Not Found</h2>
          <p className="text-muted-foreground mb-4">This collection may have been deleted.</p>
          <Button onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Documents
          </Button>

          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Folder className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">{folder.name}</h1>
              {folder.description && (
                <p className="text-muted-foreground mt-1">{folder.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary font-medium text-secondary-foreground">
                  {folder.course}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  {folder.professor}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <FileText className="h-4 w-4" />
                  {folder.documentCount} documents
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  Created {formatDate(folder.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-lg font-semibold mb-4">Documents in this collection</h2>
        
        {documents.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-2xl">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No documents in this collection yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {documents.map((doc) => (
              <DocumentCard key={doc.id} document={doc} onDownload={trackDownload} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
