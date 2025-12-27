import { Link } from "react-router-dom";
import { ArrowLeft, FileText, User, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDocuments, useAnalytics } from "@/hooks/useDatabase";

const Courses = () => {
  const { documents } = useDocuments();
  const { analytics } = useAnalytics();

  // Group documents by course
  const courseData = documents.reduce((acc, doc) => {
    if (!acc[doc.course]) {
      acc[doc.course] = {
        course: doc.course,
        documents: 0,
        downloads: 0,
        professors: new Set<string>(),
      };
    }
    acc[doc.course].documents += 1;
    acc[doc.course].downloads += doc.downloads;
    acc[doc.course].professors.add(doc.professor);
    return acc;
  }, {} as Record<string, { course: string; documents: number; downloads: number; professors: Set<string> }>);

  const courses = Object.values(courseData)
    .map(c => ({
      ...c,
      professorCount: c.professors.size,
      professorList: Array.from(c.professors),
    }))
    .sort((a, b) => b.documents - a.documents);

  const colors = [
    "hsl(211, 100%, 50%)",
    "hsl(172, 66%, 50%)",
    "hsl(262, 83%, 58%)",
    "hsl(25, 95%, 53%)",
    "hsl(340, 82%, 52%)",
    "hsl(47, 96%, 53%)",
    "hsl(142, 71%, 45%)",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b">
        <div className="container mx-auto px-6">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-semibold">Courses</h1>
                <p className="text-sm text-muted-foreground">Browse by course code</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <div className="bg-card rounded-2xl border border-border p-6">
            <p className="text-3xl font-semibold text-foreground">{analytics.uniqueCourses}</p>
            <p className="text-sm text-muted-foreground mt-1">Total Courses</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-6">
            <p className="text-3xl font-semibold text-foreground">{analytics.totalDocuments}</p>
            <p className="text-sm text-muted-foreground mt-1">Total Documents</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-6">
            <p className="text-3xl font-semibold text-foreground">{analytics.uniqueProfessors}</p>
            <p className="text-sm text-muted-foreground mt-1">Professors</p>
          </div>
        </div>

        {/* Course List */}
        {courses.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course, index) => (
              <Link
                key={course.course}
                to={`/?search=${encodeURIComponent(course.course)}`}
                className="bg-card rounded-2xl border border-border p-6 hover-lift cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  >
                    {course.course.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {course.course}
                    </h3>
                    <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" />
                        {course.documents} docs
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        {course.professorCount} prof{course.professorCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground truncate">
                      {course.professorList.slice(0, 2).join(', ')}
                      {course.professorList.length > 2 && ` +${course.professorList.length - 2} more`}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No courses yet</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
              Upload documents to see courses appear here.
            </p>
            <Link to="/">
              <Button className="mt-4">
                Go to Home
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default Courses;
