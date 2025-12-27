import { FileText, Users, GraduationCap, TrendingUp } from "lucide-react";

const stats = [
  { icon: FileText, label: "Documents", value: "2,847" },
  { icon: Users, label: "Contributors", value: "1,234" },
  { icon: GraduationCap, label: "Courses", value: "156" },
  { icon: TrendingUp, label: "Downloads", value: "45.2K" },
];

export function Stats() {
  return (
    <section className="py-12 border-y border-border bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={stat.label} 
              className="text-center animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-3">
                <stat.icon className="h-5 w-5" />
              </div>
              <div className="text-2xl md:text-3xl font-semibold text-foreground">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
