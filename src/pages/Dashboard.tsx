import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import { 
  ArrowLeft, TrendingUp, FileText, Users, GraduationCap, 
  Download, Calendar, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAnalytics } from "@/hooks/useDatabase";

const StatCard = ({ 
  icon: Icon, 
  label, 
  value, 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: string | number; 
}) => (
  <div className="bg-card rounded-2xl border border-border p-6 hover-lift">
    <div className="flex items-start justify-between">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
        <Icon className="h-5 w-5 text-primary" />
      </div>
    </div>
    <div className="mt-4">
      <p className="text-3xl font-semibold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month");
  const { analytics, refresh } = useAnalytics();

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [refresh]);

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
                <h1 className="text-lg font-semibold">Analytics Dashboard</h1>
                <p className="text-sm text-muted-foreground">Real-time upload and engagement data</p>
              </div>
            </div>

            {/* Time range selector */}
            <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
              {(["week", "month", "year"] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                    timeRange === range 
                      ? "bg-background text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard 
            icon={FileText} 
            label="Total Documents" 
            value={analytics.totalDocuments}
          />
          <StatCard 
            icon={Download} 
            label="Total Downloads" 
            value={analytics.totalDownloads}
          />
          <StatCard 
            icon={Users} 
            label="Unique Professors" 
            value={analytics.uniqueProfessors}
          />
          <StatCard 
            icon={GraduationCap} 
            label="Courses Covered" 
            value={analytics.uniqueCourses}
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid gap-6 lg:grid-cols-2 mb-6">
          {/* Uploads Over Time */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold">Uploads Over Time</h2>
                <p className="text-sm text-muted-foreground">Monthly upload trends</p>
              </div>
              {analytics.uploadsOverTime.some(d => d.uploads > 0) && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span>Live data</span>
                </div>
              )}
            </div>
            <div className="h-64">
              {analytics.uploadsOverTime.some(d => d.uploads > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.uploadsOverTime}>
                    <defs>
                      <linearGradient id="uploadGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(211, 100%, 50%)" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="hsl(211, 100%, 50%)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                        boxShadow: 'var(--shadow-medium)'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="uploads" 
                      stroke="hsl(211, 100%, 50%)" 
                      strokeWidth={2}
                      fill="url(#uploadGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Upload documents to see trends
                </div>
              )}
            </div>
          </div>

          {/* Downloads Trend */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold">Weekly Downloads</h2>
                <p className="text-sm text-muted-foreground">Downloads this week</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Last 7 days</span>
              </div>
            </div>
            <div className="h-64">
              {analytics.downloadTrends.some(d => d.downloads > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.downloadTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                        boxShadow: 'var(--shadow-medium)'
                      }}
                    />
                    <Bar 
                      dataKey="downloads" 
                      fill="hsl(211, 100%, 50%)" 
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Download documents to see trends
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid gap-6 lg:grid-cols-3 mb-6">
          {/* Course Distribution */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold">Top Courses</h2>
              <p className="text-sm text-muted-foreground">By document count</p>
            </div>
            <div className="space-y-4">
              {analytics.courseDistribution.length > 0 ? (
                analytics.courseDistribution.map((course, index) => {
                  const colors = [
                    "hsl(211, 100%, 50%)",
                    "hsl(172, 66%, 50%)",
                    "hsl(262, 83%, 58%)",
                    "hsl(25, 95%, 53%)",
                    "hsl(340, 82%, 52%)",
                  ];
                  const color = colors[index % colors.length];
                  return (
                    <div key={course.course} className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{course.course}</span>
                          <span className="text-sm text-muted-foreground">{course.documents}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500"
                            style={{ 
                              width: `${(course.documents / (analytics.courseDistribution[0]?.documents || 1)) * 100}%`,
                              backgroundColor: color 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-muted-foreground text-center py-8">No courses yet</p>
              )}
            </div>
          </div>

          {/* Document Types */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold">Document Types</h2>
              <p className="text-sm text-muted-foreground">File format breakdown</p>
            </div>
            <div className="h-48 flex items-center justify-center">
              {analytics.documentTypes.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.documentTypes}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {analytics.documentTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground">No documents yet</p>
              )}
            </div>
            {analytics.documentTypes.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-4">
                {analytics.documentTypes.slice(0, 4).map((type) => (
                  <div key={type.name} className="flex items-center gap-2 text-sm">
                    <div 
                      className="w-2.5 h-2.5 rounded-full" 
                      style={{ backgroundColor: type.fill }}
                    />
                    <span className="text-muted-foreground">{type.name}</span>
                    <span className="font-medium ml-auto">{type.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Professors */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold">Top Instructors</h2>
                <p className="text-sm text-muted-foreground">Most shared materials</p>
              </div>
            </div>
            <div className="space-y-4">
              {analytics.topProfessors.length > 0 ? (
                analytics.topProfessors.map((prof, index) => (
                  <div 
                    key={prof.name} 
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-semibold text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{prof.name}</p>
                      <p className="text-xs text-muted-foreground">{prof.course} • {prof.documents} docs</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">No instructors yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold">Recent Activity</h2>
              <p className="text-sm text-muted-foreground">Latest uploads and downloads</p>
            </div>
          </div>
          <div className="space-y-4">
            {analytics.recentActivity.length > 0 ? (
              analytics.recentActivity.map((activity, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    activity.type === "upload" ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                  }`}>
                    {activity.type === "upload" ? (
                      <FileText className="h-5 w-5" />
                    ) : (
                      <Download className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{activity.document}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.type === "upload" ? "Uploaded" : "Downloaded"}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No activity yet. Upload or download documents to see activity here.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
