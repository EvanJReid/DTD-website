import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Upload, BarChart3, FolderPlus, LogIn, LogOut, Moon, Sun, Trophy, User, Briefcase } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/useAuth';
import { AuthModal } from './AuthModal';

interface HeaderProps {
  onUploadClick: () => void;
  onFolderClick?: () => void;
}

export function Header({ onUploadClick, onFolderClick }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <>
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
              <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </Link>
              <Link to="/leaderboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                <Trophy className="h-4 w-4" />
                Leaderboard
              </Link>
              <Link to="/coop" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                <Briefcase className="h-4 w-4" />
                Co-ops
              </Link>
            </nav>

            <div className="flex items-center gap-2">
              {/* Dark mode toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="h-9 w-9"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>

              {user ? (
                <>
                  <Link to="/profile">
                    <Button variant="outline" size="sm">
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline max-w-[120px] truncate">{user.email.split('@')[0]}</span>
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={logout}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setAuthOpen(true)}>
                  <LogIn className="h-4 w-4" />
                  Sign in
                </Button>
              )}

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

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
