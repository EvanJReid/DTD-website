import { useState } from "react";
import { FileText, FileSpreadsheet, FileCode, Presentation, Download, Calendar, User, Eye } from "lucide-react";
import { Button } from "./ui/button";
import { Document } from "@/lib/api";
import { DocumentPreview } from "./DocumentPreview";

interface DocumentCardProps {
  document: Document;
  onDownload?: (documentId: string) => void;
}

const fileTypeIcons: Record<string, React.ReactNode> = {
  pdf: <FileText className="h-6 w-6" />,
  excel: <FileSpreadsheet className="h-6 w-6" />,
  python: <FileCode className="h-6 w-6" />,
  java: <FileCode className="h-6 w-6" />,
  powerpoint: <Presentation className="h-6 w-6" />,
  other: <FileText className="h-6 w-6" />,
};

const fileTypeColors: Record<string, string> = {
  pdf: "bg-red-50 text-red-600",
  excel: "bg-green-50 text-green-600",
  python: "bg-yellow-50 text-yellow-600",
  java: "bg-orange-50 text-orange-600",
  powerpoint: "bg-amber-50 text-amber-600",
  other: "bg-muted text-muted-foreground",
};

const formatDate = (isoString: string) => {
  return new Date(isoString).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

export function DocumentCard({ document, onDownload }: DocumentCardProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const icon = fileTypeIcons[document.fileType] || fileTypeIcons.other;
  const colorClass = fileTypeColors[document.fileType] || fileTypeColors.other;

  const handleCardClick = () => {
    setIsPreviewOpen(true);
  };

  const handleDownload = (documentId: string) => {
    onDownload?.(documentId);
  };

  return (
    <>
      <div 
        className="group relative bg-card rounded-2xl border border-border p-6 hover-lift cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="flex items-start gap-4">
          {/* File type icon */}
          <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${colorClass}`}>
            {icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
              {document.title}
            </h3>
            
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary font-medium text-secondary-foreground">
                {document.course}
              </span>
              <span className="inline-flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                {document.professor}
              </span>
            </div>

            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(document.uploadedAt)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Download className="h-3.5 w-3.5" />
                {document.downloads} downloads
              </span>
            </div>
          </div>

          {/* Preview button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              setIsPreviewOpen(true);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>

        {/* File type badge */}
        <div className="absolute top-4 right-4">
          <span className="text-xs font-medium uppercase text-muted-foreground">
            {document.fileType}
          </span>
        </div>
      </div>

      <DocumentPreview
        document={document}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onDownload={handleDownload}
      />
    </>
  );
}
