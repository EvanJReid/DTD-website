import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, User, ChevronRight, Search, BookOpen, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDocuments, useAnalytics, useProfessorRatings } from "@/hooks/useDatabase";

const colors = [
  "hsl(270, 65%, 45%)",
  "hsl(280, 70%, 50%)",
  "hsl(260, 60%, 55%)",
  "hsl(290, 55%, 50%)",
  "hsl(250, 65%, 50%)",
  "hsl(275, 60%, 55%)",
  "hsl(265, 70%, 48%)",
];

const Courses = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [tab, setTab] = useState<'courses' | 'professors'>('courses');
  const navigate = useNavigate();
  const { documents } = useDocuments();
  const { analytics } = useAnalytics();
  const { getProfessorRating } = useProfessorRatings();

  // Group by course
  const courseMap = documents.reduce((acc, doc) => {
    if (!acc[doc.course]) acc[doc.course] = { documents: 0, downloads: 0, professors: new Set<string>() };
    acc[doc.course].documents += 1;
    acc[doc.course].downloads += doc.downloads;
    acc[doc.course].professors.add(doc.professor);
    return acc;
  }, {} as Record<string, { documents: number; downloads: number; professors: Set<string> }>);

  const courses = Object.entries(courseMap)
    .map(([course, data]) => ({ course, ...data, professorList: Array.from(data.professors) }))
    .sort((a, b) => b.documents - a.documents);

  // Group by professor
  const profMap = documents.reduce((acc, doc) => {
    if (!acc[doc.professor]) acc[doc.professor] = { documents: 0, downloads: 0, courses: new Set<string>() };
    acc[doc.professor].documents += 1;
    acc[doc.professor].downloads += doc.downloads;
    acc[doc.professor].courses.add(doc.course);
    return acc;
  }, {} as Record<string, { documents: number; downloads: number; courses: Set<string> }>);

  const professors = Object.entries(profMap)
    .map(([name, data]) => ({ name, ...data, courseList: Array.from(data.courses) }))
    .sort((a, b) => b.documents - a.documents);

  const filteredCourses = courses.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return c.course.toLowerCase().includes(q) || c.professorList.some((p) => p.toLowerCase().includes(q));
  });

  const filteredProfessors = professors.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.courseList.some((c) => c.toLowerCase().includes(q));
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 glass border-b">
        <div className="container mx-auto px-6">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
              </Link>
              <div>
                <h1 className="text-lg font-semibold">Browse</h1>
                <p className="text-sm text-muted-foreground">Courses & Professors</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={tab === 'courses' ? 'Search by course code or professor...' : 'Search by professor or course...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <div className="bg-card rounded-2xl border border-border p-6">
            <p className="text-3xl font-semibold">{analytics?.uniqueCourses ?? 0}</p>
            <p className="text-sm text-muted-foreground mt-1">Courses</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-6">
            <p className="text-3xl font-semibold">{analytics?.totalDocuments ?? 0}</p>
            <p className="text-sm text-muted-foreground mt-1">Documents</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-6">
            <p className="text-3xl font-semibold">{analytics?.uniqueProfessors ?? 0}</p>
            <p className="text-sm text-muted-foreground mt-1">Professors</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-muted/50 rounded-xl w-fit mb-6">
          <button
            onClick={() => setTab('courses')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'courses' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <BookOpen className="h-4 w-4 inline mr-2" />
            Courses ({filteredCourses.length})
          </button>
          <button
            onClick={() => setTab('professors')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'professors' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <User className="h-4 w-4 inline mr-2" />
            Professors ({filteredProfessors.length})
          </button>
        </div>

        {/* Courses grid */}
        {tab === 'courses' && (
          filteredCourses.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredCourses.map((course, index) => (
                <button
                  key={course.course}
                  onClick={() => navigate(`/course/${encodeURIComponent(course.course)}`)}
                  className="bg-card rounded-2xl border border-border p-6 hover-lift cursor-pointer group text-left"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold flex-shrink-0"
                      style={{ backgroundColor: colors[index % colors.length] }}
                    >
                      {course.course.slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold group-hover:text-primary transition-colors">{course.course}</h3>
                      <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <FileText className="h-3.5 w-3.5" />{course.documents} docs
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />{course.professors.size} prof{course.professors.size !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground truncate">
                        {course.professorList.slice(0, 2).join(', ')}
                        {course.professorList.length > 2 && ` +${course.professorList.length - 2} more`}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">No courses found.</div>
          )
        )}

        {/* Professors grid */}
        {tab === 'professors' && (
          filteredProfessors.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredProfessors.map((prof, index) => (
                <button
                  key={prof.name}
                  onClick={() => navigate(`/professor/${encodeURIComponent(prof.name)}`)}
                  className="bg-card rounded-2xl border border-border p-6 hover-lift cursor-pointer group text-left"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 text-lg"
                      style={{ backgroundColor: colors[index % colors.length] }}
                    >
                      {prof.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold group-hover:text-primary transition-colors truncate">{prof.name}</h3>
                      {(() => {
                        const rating = getProfessorRating(prof.name);
                        return rating.ratingCount > 0 ? (
                          <div className="mt-1 flex items-center gap-1">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} className={`h-3 w-3 ${s <= Math.round(rating.averageRating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`} />
                            ))}
                            <span className="text-xs text-muted-foreground ml-1">{rating.averageRating.toFixed(1)}</span>
                          </div>
                        ) : null;
                      })()}
                      <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <FileText className="h-3.5 w-3.5" />{prof.documents} docs
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <BookOpen className="h-3.5 w-3.5" />{prof.courses.size} course{prof.courses.size !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground truncate">
                        {prof.courseList.slice(0, 3).join(', ')}
                        {prof.courseList.length > 3 && ` +${prof.courseList.length - 3} more`}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">No professors found.</div>
          )
        )}
      </main>
    </div>
  );
};

export default Courses;
