import { Folder, FileText, Calendar, User, ChevronRight } from "lucide-react";
import { Folder as FolderType } from "@/lib/api";
import { useNavigate } from "react-router-dom";

interface FolderCardProps {
  folder: FolderType;
}

const formatDate = (isoString: string) => {
  return new Date(isoString).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

export function FolderCard({ folder }: FolderCardProps) {
  const navigate = useNavigate();

  return (
    <div 
      className="group relative bg-card rounded-2xl border border-border p-6 hover-lift cursor-pointer"
      onClick={() => navigate(`/folder/${folder.id}`)}
    >
      <div className="flex items-start gap-4">
        {/* Folder icon */}
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Folder className="h-6 w-6" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
            {folder.name}
          </h3>
          
          {folder.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {folder.description}
            </p>
          )}
          
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary font-medium text-secondary-foreground">
              {folder.course}
            </span>
            <span className="inline-flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {folder.professor}
            </span>
          </div>

          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" />
              {folder.documentCount} {folder.documentCount === 1 ? 'document' : 'documents'}
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(folder.createdAt)}
            </span>
          </div>
        </div>

        {/* Arrow indicator */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>

      {/* Badge */}
      <div className="absolute top-4 right-4">
        <span className="text-xs font-medium uppercase text-primary bg-primary/10 px-2 py-1 rounded-md">
          Collection
        </span>
      </div>
    </div>
  );
}
