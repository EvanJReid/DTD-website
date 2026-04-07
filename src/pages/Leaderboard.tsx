import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trophy, Upload, BookOpen, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LeaderboardEntry {
  username: string;
  upload_count: number;
  courses_covered: number;
  total_downloads: number;
}

const BASE_URL = import.meta.env.VITE_ORACLE_APEX_URL || 'https://129-213-123-67.sslip.io/api';

const medals = ['🥇', '🥈', '🥉'];

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE_URL}/leaderboard`)
      .then((r) => r.json())
      .then((data) =>
        setEntries(
          data
            .map((e: LeaderboardEntry) => ({
              ...e,
              upload_count: parseInt(String(e.upload_count)) || 0,
              courses_covered: parseInt(String(e.courses_covered)) || 0,
              total_downloads: parseInt(String(e.total_downloads)) || 0,
            }))
            .filter((e: LeaderboardEntry) =>
              e.upload_count > 0 && !e.username.startsWith('system@')
            )
        )
      )
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link to="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Leaderboard</h1>
              <p className="text-sm text-muted-foreground">Top contributors to the DTD academic database</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">No contributions yet.</div>
        ) : (
          <div className="space-y-3">
            {/* Top 3 podium */}
            {entries.length >= 3 && (
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[entries[1], entries[0], entries[2]].map((entry, i) => {
                  const rank = i === 1 ? 0 : i === 0 ? 1 : 2;
                  const sizes = ['h-28', 'h-36', 'h-24'];
                  return (
                    <div
                      key={entry.username}
                      className={`bg-card border border-border rounded-2xl flex flex-col items-center justify-end p-4 ${sizes[i]}`}
                    >
                      <span className="text-2xl mb-1">{medals[rank]}</span>
                      <p className="text-xs font-medium text-center truncate w-full">
                        {entry.username.split('@')[0]}
                      </p>
                      <p className="text-lg font-bold text-primary">{entry.upload_count}</p>
                      <p className="text-xs text-muted-foreground">uploads</p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Full list */}
            {entries.map((entry, index) => (
              <div
                key={entry.username}
                className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4"
              >
                <div className="w-10 text-center">
                  {index < 3 ? (
                    <span className="text-xl">{medals[index]}</span>
                  ) : (
                    <span className="text-sm font-bold text-muted-foreground">#{index + 1}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{entry.username}</p>
                  <p className="text-xs text-muted-foreground">{entry.username.split('@')[1] || ''}</p>
                </div>

                <div className="flex gap-6 text-center">
                  <div>
                    <div className="flex items-center gap-1 text-sm font-semibold">
                      <Upload className="h-3.5 w-3.5 text-primary" />
                      {entry.upload_count}
                    </div>
                    <p className="text-xs text-muted-foreground">uploads</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-sm font-semibold">
                      <BookOpen className="h-3.5 w-3.5 text-primary" />
                      {entry.courses_covered}
                    </div>
                    <p className="text-xs text-muted-foreground">courses</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-sm font-semibold">
                      <Download className="h-3.5 w-3.5 text-primary" />
                      {entry.total_downloads}
                    </div>
                    <p className="text-xs text-muted-foreground">downloads</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
