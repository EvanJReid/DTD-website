import { Link } from "react-router-dom";
import { GraduationCap, Upload, BarChart3, FolderPlus, Briefcase } from "lucide-react";
import { Button } from "./ui/button";

interface HeaderProps {
  onUploadClick: () => void;
  onFolderClick?: () => void;
}

export function Header({ onUploadClick, onFolderClick }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b">
      <div className="container mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold tracking-tight leading-tight">ΔΤΔ</span>
              <span className="text-[10px] text-muted-foreground leading-tight">Academic Database</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Browse
            </Link>
            <Link to="/courses" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Courses
            </Link>
            <Link to="/coops" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
              <Briefcase className="h-4 w-4" />
              Co-ops
            </Link>
            <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                <BarChart3 className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            {onFolderClick && (
              <Button onClick={onFolderClick} variant="secondary" size="sm">
                <FolderPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Collection</span>
              </Button>
            )}
            <Button onClick={onUploadClick} size="sm">
              <Upload className="h-4 w-4" />
              Upload
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
