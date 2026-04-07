import { Search } from "lucide-react";

interface HeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function Hero({ searchQuery, onSearchChange }: HeroProps) {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Subtle gradient background */}
      <div 
        className="absolute inset-0 -z-10"
        style={{ background: 'var(--gradient-hero)' }}
      />
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute top-40 right-1/4 w-64 h-64 bg-primary/3 rounded-full blur-3xl -z-10" />

      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-balance animate-in">
            Delta Tau Delta{" "}
            <span className="text-primary">Academic Database</span>
          </h1>
          
          <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto animate-in-delayed">
            Access course materials, study guides, and notes shared by brothers. 
            Search by course code or professor name.
          </p>

          {/* Search bar */}
          <div className="mt-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="relative max-w-2xl mx-auto">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                type="text"
                placeholder="Search by course (e.g., CS2000) or professor name..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full h-14 pl-14 pr-6 rounded-2xl bg-card border border-border shadow-soft text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Quick filters */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <span className="text-sm text-muted-foreground">Popular:</span>
            {['CS2000', 'MATH1001', 'PHYS2010', 'ECON3000'].map((course) => (
              <button
                key={course}
                onClick={() => onSearchChange(course)}
                className="px-3 py-1.5 text-sm rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
              >
                {course}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
