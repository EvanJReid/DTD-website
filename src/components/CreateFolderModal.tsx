import { useState } from "react";
import { X, Upload, Folder, FileText, Check, Plus, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFolder: (data: FolderUploadData) => Promise<void>;
}

export interface FolderUploadData {
  name: string;
  description: string;
  course: string;
  professor: string;
  files: File[];
}

const allowedExtensions = ['.pdf', '.xlsx', '.xls', '.py', '.java', '.pptx', '.ppt', '.doc', '.docx', '.txt'];

export function CreateFolderModal({ isOpen, onClose, onCreateFolder }: CreateFolderModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FolderUploadData>({
    name: "",
    description: "",
    course: "",
    professor: "",
    files: [],
  });

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      return allowedExtensions.includes(extension);
    });

    if (validFiles.length !== files.length) {
      toast.error(`${files.length - validFiles.length} file(s) skipped - unsupported format`);
    }

    if (validFiles.length > 0) {
      setFormData(prev => ({
        ...prev,
        files: [...prev.files, ...validFiles],
        name: prev.name || (validFiles[0]?.name.replace(/\.[^/.]+$/, "") ?? ""),
      }));
    }
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.files.length === 0 || !formData.course || !formData.professor || !formData.name) {
      toast.error("Please fill in all required fields and add at least one file.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreateFolder(formData);
      toast.success(`Folder "${formData.name}" created with ${formData.files.length} documents!`);
      setFormData({ name: "", description: "", course: "", professor: "", files: [] });
      onClose();
    } catch (error) {
      toast.error("Failed to create folder. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalSize = formData.files.reduce((sum, f) => sum + f.size, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-card rounded-2xl shadow-medium border border-border overflow-hidden animate-in max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Folder className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Create Document Collection</h2>
              <p className="text-sm text-muted-foreground">
                Upload multiple files as an organized set
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* File upload area */}
          <div
            className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${
              dragActive 
                ? "border-primary bg-primary/5" 
                : formData.files.length > 0 
                  ? "border-primary/50 bg-primary/5" 
                  : "border-border hover:border-muted-foreground/50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              multiple
              accept={allowedExtensions.join(',')}
              onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="font-medium text-foreground">
                {formData.files.length > 0 ? "Add more files" : "Drop files here"}
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse • Multiple files supported
              </p>
            </div>
          </div>

          {/* File list */}
          {formData.files.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{formData.files.length} file(s) selected</span>
                <span className="text-muted-foreground">{(totalSize / 1024 / 1024).toFixed(2)} MB total</span>
              </div>
              <div className="max-h-32 overflow-y-auto space-y-1 border border-border rounded-xl p-2">
                {formData.files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between gap-2 px-3 py-2 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm truncate">{file.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="p-1 hover:bg-destructive/10 rounded transition-colors flex-shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Collection Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Collection Name *</label>
            <input
              type="text"
              placeholder="e.g., Lab Reports - Week 1-5"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full h-11 px-4 rounded-xl bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Description</label>
            <textarea
              placeholder="Brief description of the documents in this collection..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full h-20 px-4 py-3 rounded-xl bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Course */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Course Code *</label>
              <input
                type="text"
                placeholder="e.g., CHEM2010"
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value.toUpperCase() })}
                className="w-full h-11 px-4 rounded-xl bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            {/* Professor */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Professor *</label>
              <input
                type="text"
                placeholder="e.g., Dr. Smith"
                value={formData.professor}
                onChange={(e) => setFormData({ ...formData, professor: e.target.value })}
                className="w-full h-11 px-4 rounded-xl bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              <Folder className="h-4 w-4" />
              {isSubmitting ? "Creating..." : "Create Collection"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
