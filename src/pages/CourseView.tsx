import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DocumentCard } from "@/components/DocumentCard";
import { useDocuments } from "@/hooks/useDatabase";

export default function CourseView() {
  const { courseCode } = useParams<{ courseCode: string }>();
  const navigate = useNavigate();
  const { documents, loading, trackDownload } = useDocuments();

  const courseDocs = documents.filter(
    (d) => d.course.toLowerCase() === (courseCode || '').toLowerCase()
  );

  // Group by professor
  const byProfessor = courseDocs.reduce((acc, doc) => {
    if (!acc[doc.professor]) acc[doc.professor] = [];
    acc[doc.professor].push(doc);
    return acc;
  }, {} as Record<string, typeof courseDocs>);

  const professors = Object.keys(byProfessor).sort();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/courses")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />Back to Courses
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <BookOpen className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{courseCode}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {courseDocs.length} document{courseDocs.length !== 1 ? 's' : ''} · {professors.length} professor{professors.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-10">
        {courseDocs.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">No documents for this course.</div>
        ) : professors.length === 1 ? (
          // Single professor — just show flat grid
          <div className="grid gap-4 md:grid-cols-2">
            {courseDocs.map((doc) => (
              <DocumentCard key={doc.id} document={doc} onDownload={trackDownload} />
            ))}
          </div>
        ) : (
          // Multiple professors — group by professor
          professors.map((professor) => (
            <div key={professor}>
              <div
                className="flex items-center gap-2 mb-4 cursor-pointer group"
                onClick={() => navigate(`/professor/${encodeURIComponent(professor)}`)}
              >
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <h2 className="text-base font-semibold group-hover:text-primary transition-colors">
                    {professor}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {byProfessor[professor].length} document{byProfessor[professor].length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {byProfessor[professor].map((doc) => (
                  <DocumentCard key={doc.id} document={doc} onDownload={trackDownload} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
