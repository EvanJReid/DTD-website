import { DocumentCard } from "./DocumentCard";
import { Document } from "@/lib/database";
import { FileX } from "lucide-react";

interface DocumentGridProps {
  documents: Document[];
  searchQuery: string;
  onDownload?: (documentId: string) => void;
}

export function DocumentGrid({ documents, searchQuery, onDownload }: DocumentGridProps) {
  const filteredDocuments = documents.filter((doc) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      doc.title.toLowerCase().includes(query) ||
      doc.course.toLowerCase().includes(query) ||
      doc.professor.toLowerCase().includes(query)
    );
  });

  return (
    <section className="py-16">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              {searchQuery ? `Results for "${searchQuery}"` : "Recent Uploads"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''} available
            </p>
          </div>
        </div>

        {filteredDocuments.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredDocuments.map((doc, index) => (
              <div
                key={doc.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <DocumentCard document={doc} onDownload={onDownload} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <FileX className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No documents found</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm">
              Try adjusting your search or browse all available materials.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
