import { Link } from "react-router-dom";
import { BookOpen, Upload, BarChart3 } from "lucide-react";
import { Button } from "./ui/button";

interface HeaderProps {
  onUploadClick: () => void;
}

export function Header({ onUploadClick }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b">
      <div className="container mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold tracking-tight">StudyHub</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Browse
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Courses
            </a>
            <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                <BarChart3 className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
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
