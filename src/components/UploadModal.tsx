import { useState } from "react";
import { X, Upload, FileText, Check } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (data: UploadData) => void;
}

export interface UploadData {
  title: string;
  course: string;
  professor: string;
  file: File | null;
}

const allowedExtensions = ['.pdf', '.xlsx', '.xls', '.py', '.java', '.pptx', '.ppt', '.doc', '.docx', '.txt'];

export function UploadModal({ isOpen, onClose, onUpload }: UploadModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [formData, setFormData] = useState<UploadData>({
    title: "",
    course: "",
    professor: "",
    file: null,
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
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      toast.error("Unsupported file type. Please upload PDF, Excel, Python, Java, or PowerPoint files.");
      return;
    }
    setFormData({ ...formData, file, title: formData.title || file.name.replace(/\.[^/.]+$/, "") });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file || !formData.course || !formData.professor || !formData.title) {
      toast.error("Please fill in all fields and select a file.");
      return;
    }
    onUpload(formData);
    toast.success("Document uploaded successfully!");
    setFormData({ title: "", course: "", professor: "", file: null });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-card rounded-2xl shadow-medium border border-border overflow-hidden animate-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold">Upload Document</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Share study materials with your peers
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* File upload area */}
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              dragActive 
                ? "border-primary bg-primary/5" 
                : formData.file 
                  ? "border-green-500 bg-green-50" 
                  : "border-border hover:border-muted-foreground/50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept={allowedExtensions.join(',')}
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            {formData.file ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <p className="font-medium text-foreground">{formData.file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="font-medium text-foreground">Drop your file here</p>
                <p className="text-sm text-muted-foreground">
                  or click to browse • PDF, Excel, Python, Java, PowerPoint
                </p>
              </div>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Document Title</label>
            <input
              type="text"
              placeholder="e.g., Midterm Study Guide"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full h-11 px-4 rounded-xl bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Course */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Course Code</label>
            <input
              type="text"
              placeholder="e.g., CS2000"
              value={formData.course}
              onChange={(e) => setFormData({ ...formData, course: e.target.value.toUpperCase() })}
              className="w-full h-11 px-4 rounded-xl bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Professor */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Professor Name</label>
            <input
              type="text"
              placeholder="e.g., Prof. Elizabeth Wilson"
              value={formData.professor}
              onChange={(e) => setFormData({ ...formData, professor: e.target.value })}
              className="w-full h-11 px-4 rounded-xl bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              <Upload className="h-4 w-4" />
              Upload
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
