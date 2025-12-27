import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart
} from "recharts";
import { 
  ArrowLeft, TrendingUp, FileText, Users, GraduationCap, 
  Download, Calendar, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Sample analytics data
const uploadsOverTime = [
  { month: "Jul", uploads: 45 },
  { month: "Aug", uploads: 78 },
  { month: "Sep", uploads: 156 },
  { month: "Oct", uploads: 234 },
  { month: "Nov", uploads: 312 },
  { month: "Dec", uploads: 287 },
];

const courseDistribution = [
  { name: "CS2000", documents: 456, color: "hsl(211, 100%, 50%)" },
  { name: "MATH1001", documents: 324, color: "hsl(172, 66%, 50%)" },
  { name: "PHYS2010", documents: 267, color: "hsl(262, 83%, 58%)" },
  { name: "ECON3000", documents: 198, color: "hsl(25, 95%, 53%)" },
  { name: "CHEM1500", documents: 156, color: "hsl(340, 82%, 52%)" },
];

const documentTypes = [
  { type: "PDF", count: 1234, percentage: 43 },
  { type: "PowerPoint", count: 567, percentage: 20 },
  { type: "Excel", count: 456, percentage: 16 },
  { type: "Python", count: 312, percentage: 11 },
  { type: "Java", count: 278, percentage: 10 },
];

const topProfessors = [
  { name: "Prof. Elizabeth Wilson", course: "CS2000", documents: 89, downloads: 2345 },
  { name: "Dr. James Chen", course: "MATH1001", documents: 67, downloads: 1890 },
  { name: "Dr. Sarah Miller", course: "PHYS2010", documents: 54, downloads: 1567 },
  { name: "Prof. Michael Brown", course: "ECON3000", documents: 48, downloads: 1234 },
  { name: "Dr. Emily Davis", course: "CHEM1500", documents: 42, downloads: 987 },
];

const downloadTrends = [
  { day: "Mon", downloads: 1234 },
  { day: "Tue", downloads: 1567 },
  { day: "Wed", downloads: 1890 },
  { day: "Thu", downloads: 2100 },
  { day: "Fri", downloads: 2456 },
  { day: "Sat", downloads: 1678 },
  { day: "Sun", downloads: 1345 },
];

const StatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  change, 
  changeType 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: string; 
  change: string; 
  changeType: "positive" | "negative";
}) => (
  <div className="bg-card rounded-2xl border border-border p-6 hover-lift">
    <div className="flex items-start justify-between">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <span className={`text-sm font-medium ${changeType === "positive" ? "text-green-600" : "text-red-500"}`}>
        {change}
      </span>
    </div>
    <div className="mt-4">
      <p className="text-3xl font-semibold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month");

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
                <p className="text-sm text-muted-foreground">Track uploads and engagement</p>
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
            value="2,847" 
            change="+12.5%" 
            changeType="positive" 
          />
          <StatCard 
            icon={Download} 
            label="Total Downloads" 
            value="45.2K" 
            change="+8.3%" 
            changeType="positive" 
          />
          <StatCard 
            icon={Users} 
            label="Active Contributors" 
            value="1,234" 
            change="+5.7%" 
            changeType="positive" 
          />
          <StatCard 
            icon={GraduationCap} 
            label="Courses Covered" 
            value="156" 
            change="+3.2%" 
            changeType="positive" 
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
              <div className="flex items-center gap-2 text-sm text-green-600">
                <TrendingUp className="h-4 w-4" />
                <span>+23% vs last period</span>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={uploadsOverTime}>
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
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={downloadTrends}>
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
              {courseDistribution.map((course) => (
                <div key={course.name} className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: course.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{course.name}</span>
                      <span className="text-sm text-muted-foreground">{course.documents}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${(course.documents / courseDistribution[0].documents) * 100}%`,
                          backgroundColor: course.color 
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Document Types */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold">Document Types</h2>
              <p className="text-sm text-muted-foreground">File format breakdown</p>
            </div>
            <div className="h-48 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={documentTypes}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="count"
                  >
                    {documentTypes.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={[
                          "hsl(0, 72%, 51%)", 
                          "hsl(25, 95%, 53%)", 
                          "hsl(142, 71%, 45%)", 
                          "hsl(47, 96%, 53%)", 
                          "hsl(262, 83%, 58%)"
                        ][index]}
                      />
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
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {documentTypes.slice(0, 4).map((type, index) => (
                <div key={type.type} className="flex items-center gap-2 text-sm">
                  <div 
                    className="w-2.5 h-2.5 rounded-full" 
                    style={{ 
                      backgroundColor: [
                        "hsl(0, 72%, 51%)", 
                        "hsl(25, 95%, 53%)", 
                        "hsl(142, 71%, 45%)", 
                        "hsl(47, 96%, 53%)"
                      ][index] 
                    }}
                  />
                  <span className="text-muted-foreground">{type.type}</span>
                  <span className="font-medium ml-auto">{type.percentage}%</span>
                </div>
              ))}
            </div>
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
              {topProfessors.slice(0, 5).map((prof, index) => (
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
              ))}
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
            <Button variant="ghost" size="sm">
              View all
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="space-y-4">
            {[
              { action: "uploaded", file: "Data Structures Final Review.pdf", course: "CS2000", time: "2 hours ago" },
              { action: "downloaded", file: "Linear Algebra Practice Problems.pdf", course: "MATH1001", time: "3 hours ago" },
              { action: "uploaded", file: "Binary Search Tree Implementation.py", course: "CS2000", time: "5 hours ago" },
              { action: "downloaded", file: "Physics Lab Data Analysis.xlsx", course: "PHYS2010", time: "6 hours ago" },
            ].map((activity, index) => (
              <div 
                key={index}
                className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  activity.action === "uploaded" ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                }`}>
                  {activity.action === "uploaded" ? (
                    <FileText className="h-5 w-5" />
                  ) : (
                    <Download className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{activity.file}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.action === "uploaded" ? "Uploaded to" : "Downloaded from"} {activity.course}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
