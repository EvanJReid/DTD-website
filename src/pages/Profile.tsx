import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload, Download, FileText, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

interface ProfileData {
  email: string;
  uploads: {
    id: string;
    title: string;
    course: string;
    professor: string;
    uploadedAt: string;
    downloads: number;
  }[];
  downloads: {
    documentId: string;
    title: string;
    course: string;
    downloadedAt: string;
  }[];
}

const BASE_URL = import.meta.env.VITE_ORACLE_APEX_URL || 'https://129-213-123-67.sslip.io/api';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('dtd_token');
    fetch(`${BASE_URL}/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setProfile)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Sign in to view your profile.</p>
          <Link to="/"><Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link to="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">{user.email}</h1>
            <p className="text-sm text-muted-foreground">Your upload and download history</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center gap-2 text-primary mb-2">
                  <Upload className="h-5 w-5" />
                  <span className="text-sm font-medium">Uploads</span>
                </div>
                <p className="text-3xl font-semibold">{profile?.uploads.length ?? 0}</p>
              </div>
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center gap-2 text-primary mb-2">
                  <Download className="h-5 w-5" />
                  <span className="text-sm font-medium">Downloads</span>
                </div>
                <p className="text-3xl font-semibold">{profile?.downloads.length ?? 0}</p>
              </div>
            </div>

            {/* Uploads */}
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" /> Your Uploads
              </h2>
              {profile?.uploads.length === 0 ? (
                <p className="text-muted-foreground text-sm">No uploads yet.</p>
              ) : (
                <div className="space-y-3">
                  {profile?.uploads.map((doc) => (
                    <div key={doc.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{doc.title}</p>
                        <p className="text-xs text-muted-foreground">{doc.course} · {doc.professor}</p>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <div className="flex items-center gap-1 justify-end">
                          <Calendar className="h-3 w-3" />
                          {formatDate(doc.uploadedAt)}
                        </div>
                        <div className="flex items-center gap-1 justify-end mt-1">
                          <Download className="h-3 w-3" />
                          {doc.downloads} downloads
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Downloads */}
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Download className="h-5 w-5 text-primary" /> Download History
              </h2>
              {profile?.downloads.length === 0 ? (
                <p className="text-muted-foreground text-sm">No downloads yet.</p>
              ) : (
                <div className="space-y-3">
                  {profile?.downloads.map((item, i) => (
                    <div key={i} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                        <Download className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.course}</p>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(item.downloadedAt)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
