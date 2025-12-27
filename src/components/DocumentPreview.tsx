import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Document } from "@/lib/database";
import { useComments } from "@/hooks/useDatabase";
import { 
  FileText, FileSpreadsheet, FileCode, Presentation, 
  Download, Calendar, User, Eye, X, MessageCircle, Send, Trash2
} from "lucide-react";

interface DocumentPreviewProps {
  document: Document | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (documentId: string) => void;
}

const fileTypeIcons: Record<string, React.ReactNode> = {
  pdf: <FileText className="h-12 w-12" />,
  excel: <FileSpreadsheet className="h-12 w-12" />,
  python: <FileCode className="h-12 w-12" />,
  java: <FileCode className="h-12 w-12" />,
  powerpoint: <Presentation className="h-12 w-12" />,
  other: <FileText className="h-12 w-12" />,
};

const fileTypeColors: Record<string, string> = {
  pdf: "bg-red-100 text-red-600",
  excel: "bg-green-100 text-green-600",
  python: "bg-yellow-100 text-yellow-600",
  java: "bg-orange-100 text-orange-600",
  powerpoint: "bg-amber-100 text-amber-600",
  other: "bg-muted text-muted-foreground",
};

const fileTypeDescriptions: Record<string, string> = {
  pdf: "PDF Document",
  excel: "Excel Spreadsheet",
  python: "Python Source Code",
  java: "Java Source Code",
  powerpoint: "PowerPoint Presentation",
  other: "Document",
};

const formatDate = (isoString: string) => {
  return new Date(isoString).toLocaleDateString('en-US', { 
    weekday: 'long',
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

const formatTimeAgo = (isoString: string) => {
  const date = new Date(isoString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

function CommentsSection({ documentId }: { documentId: string }) {
  const { comments, addComment, deleteComment } = useComments(documentId);
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    addComment(author, content);
    setAuthor("");
    setContent("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Comments ({comments.length})</span>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          placeholder="Your name (optional)"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="h-9"
        />
        <div className="flex gap-2">
          <Textarea
            placeholder="Add a comment..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[60px] resize-none flex-1"
          />
          <Button type="submit" size="icon" disabled={!content.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>

      {/* Comments List */}
      {comments.length > 0 && (
        <ScrollArea className="max-h-48">
          <div className="space-y-3">
            {comments.map((comment) => (
              <div 
                key={comment.id} 
                className="bg-muted/50 rounded-lg p-3 group relative"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{comment.author}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(comment.createdAt)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => deleteComment(comment.id)}
                    >
                      <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{comment.content}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

export function DocumentPreview({ document, isOpen, onClose, onDownload }: DocumentPreviewProps) {
  if (!document) return null;

  const icon = fileTypeIcons[document.fileType] || fileTypeIcons.other;
  const colorClass = fileTypeColors[document.fileType] || fileTypeColors.other;
  const typeDescription = fileTypeDescriptions[document.fileType] || fileTypeDescriptions.other;

  const handleDownload = () => {
    onDownload(document.id);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Document Preview
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Document Icon and Type */}
          <div className="flex items-center gap-4">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${colorClass}`}>
              {icon}
            </div>
            <div>
              <span className="text-xs font-medium uppercase text-muted-foreground">
                {typeDescription}
              </span>
              <h3 className="text-lg font-semibold text-foreground mt-1">
                {document.title}
              </h3>
            </div>
          </div>

          {/* Document Details */}
          <div className="bg-muted/50 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Course</span>
              <span className="text-sm font-medium px-3 py-1 rounded-md bg-secondary text-secondary-foreground">
                {document.course}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Professor</span>
              <span className="text-sm font-medium flex items-center gap-1.5">
                <User className="h-4 w-4 text-muted-foreground" />
                {document.professor}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Uploaded</span>
              <span className="text-sm font-medium flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {formatDate(document.uploadedAt)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">File Name</span>
              <span className="text-sm font-medium truncate max-w-[200px]">
                {document.fileName}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Downloads</span>
              <span className="text-sm font-medium flex items-center gap-1.5">
                <Download className="h-4 w-4 text-muted-foreground" />
                {document.downloads} times
              </span>
            </div>
          </div>

          {/* Comments Section */}
          <CommentsSection documentId={document.id} />

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleDownload} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
