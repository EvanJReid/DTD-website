import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, BookOpen, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DocumentCard } from "@/components/DocumentCard";
import { useDocuments } from "@/hooks/useDatabase";
import { useProfessorRatings } from "@/hooks/useDatabase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

function StarRating({
  value,
  onChange,
  readonly = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
        >
          <Star
            className={`h-5 w-5 ${
              star <= Math.round(value)
                ? 'fill-amber-400 text-amber-400'
                : 'text-muted-foreground'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function ProfessorView() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const { documents, loading, trackDownload } = useDocuments();
  const { user } = useAuth();

  const profName = decodeURIComponent(name || '');
  const { profRating, rateProf } = useProfessorRatings(profName);

  const profDocs = documents.filter(
    (d) => d.professor.toLowerCase() === profName.toLowerCase()
  );

  const byCourse = profDocs.reduce((acc, doc) => {
    if (!acc[doc.course]) acc[doc.course] = [];
    acc[doc.course].push(doc);
    return acc;
  }, {} as Record<string, typeof profDocs>);

  const courses = Object.keys(byCourse).sort();

  const handleRate = (rating: number) => {
    if (!user) {
      toast.error('Sign in to rate professors');
      return;
    }
    rateProf(profName, rating);
    toast.success(`Rated ${profName} ${rating}/5`);
  };

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
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />Back
          </Button>
          <div className="flex items-start gap-4 flex-wrap">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
              <User className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{profName}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {profDocs.length} document{profDocs.length !== 1 ? 's' : ''} · {courses.length} course{courses.length !== 1 ? 's' : ''}
              </p>

              {/* Rating section */}
              <div className="mt-3 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <StarRating value={profRating?.averageRating ?? 0} readonly />
                  <span className="text-sm text-muted-foreground">
                    {profRating && profRating.ratingCount > 0
                      ? `${profRating.averageRating.toFixed(1)} (${profRating.ratingCount} rating${profRating.ratingCount !== 1 ? 's' : ''})`
                      : 'No ratings yet'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {user
                      ? profRating?.userRating
                        ? 'Your rating:'
                        : 'Rate this professor:'
                      : 'Sign in to rate'}
                  </span>
                  {user && (
                    <StarRating
                      value={profRating?.userRating ?? 0}
                      onChange={handleRate}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-10">
        {profDocs.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">No documents found for this professor.</div>
        ) : courses.length === 1 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {profDocs.map((doc) => (
              <DocumentCard key={doc.id} document={doc} onDownload={trackDownload} />
            ))}
          </div>
        ) : (
          courses.map((course) => (
            <div key={course}>
              <div
                className="flex items-center gap-2 mb-4 cursor-pointer group"
                onClick={() => navigate(`/course/${encodeURIComponent(course)}`)}
              >
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <h2 className="text-base font-semibold group-hover:text-primary transition-colors">
                    {course}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {byCourse[course].length} document{byCourse[course].length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {byCourse[course].map((doc) => (
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
