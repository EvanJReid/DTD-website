import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, Briefcase, MapPin, Plus, Trash2, Pencil, X, Check, Building2, Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCoops } from "@/hooks/useDatabase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { CoopEntry } from "@/lib/api/types";

type Term = 'Spring' | 'Summer' | 'Fall';
const TERMS: Term[] = ['Spring', 'Summer', 'Fall'];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear + 2 - i);

const termColors: Record<Term, string> = {
  Spring: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Summer: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Fall: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
};

const emptyForm = {
  brotherName: '',
  company: '',
  position: '',
  location: '',
  term: 'Summer' as Term,
  year: currentYear,
  notes: '',
};

interface CoopFormProps {
  initial?: Partial<typeof emptyForm>;
  onSubmit: (data: typeof emptyForm) => void;
  onCancel: () => void;
  submitLabel: string;
}

function CoopForm({ initial, onSubmit, onCancel, submitLabel }: CoopFormProps) {
  const [form, setForm] = useState({ ...emptyForm, ...initial });
  const set = (k: keyof typeof form, v: string | number) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.brotherName.trim() || !form.company.trim() || !form.position.trim() || !form.location.trim()) {
      toast.error('Please fill in brother name, company, position, and location.');
      return;
    }
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Brother Name *</label>
          <input
            value={form.brotherName}
            onChange={(e) => set('brotherName', e.target.value)}
            placeholder="e.g., John Smith"
            className="w-full h-10 px-3 rounded-xl bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Company *</label>
          <input
            value={form.company}
            onChange={(e) => set('company', e.target.value)}
            placeholder="e.g., Google"
            className="w-full h-10 px-3 rounded-xl bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Position *</label>
          <input
            value={form.position}
            onChange={(e) => set('position', e.target.value)}
            placeholder="e.g., Software Engineer Intern"
            className="w-full h-10 px-3 rounded-xl bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Location *</label>
          <input
            value={form.location}
            onChange={(e) => set('location', e.target.value)}
            placeholder="e.g., San Francisco, CA"
            className="w-full h-10 px-3 rounded-xl bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Term</label>
          <select
            value={form.term}
            onChange={(e) => set('term', e.target.value as Term)}
            className="w-full h-10 px-3 rounded-xl bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
          >
            {TERMS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Year</label>
          <select
            value={form.year}
            onChange={(e) => set('year', Number(e.target.value))}
            className="w-full h-10 px-3 rounded-xl bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
          >
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">Notes</label>
        <textarea
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
          placeholder="Any additional info..."
          rows={2}
          className="w-full px-3 py-2 rounded-xl bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm resize-none"
        />
      </div>
      <div className="flex gap-2 pt-1">
        <Button type="button" variant="secondary" size="sm" onClick={onCancel} className="flex-1">
          <X className="h-3.5 w-3.5 mr-1" /> Cancel
        </Button>
        <Button type="submit" size="sm" className="flex-1">
          <Check className="h-3.5 w-3.5 mr-1" /> {submitLabel}
        </Button>
      </div>
    </form>
  );
}

function CoopCard({
  entry,
  onDelete,
  onUpdate,
  canEdit,
}: {
  entry: CoopEntry;
  onDelete: () => void;
  onUpdate: (updates: Partial<typeof emptyForm>) => void;
  canEdit: boolean;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div className="bg-card rounded-2xl border border-primary/30 p-5">
        <CoopForm
          initial={{
            brotherName: entry.brotherName,
            company: entry.company,
            position: entry.position,
            location: entry.location,
            term: entry.term,
            year: entry.year,
            notes: entry.notes ?? '',
          }}
          onSubmit={(data) => { onUpdate(data); setEditing(false); }}
          onCancel={() => setEditing(false)}
          submitLabel="Save"
        />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-5 hover-lift group relative">
      {canEdit && (
        <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setEditing(true)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            title="Edit"
          >
            <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </button>
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
          {entry.brotherName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-foreground">{entry.brotherName}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${termColors[entry.term]}`}>
              {entry.term} {entry.year}
            </span>
          </div>

          <div className="mt-2 space-y-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="font-medium text-foreground">{entry.company}</span>
              <span>·</span>
              <span>{entry.position}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{entry.location}</span>
            </div>
          </div>

          {entry.notes && (
            <p className="mt-2 text-xs text-muted-foreground italic line-clamp-2">{entry.notes}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Coop() {
  const { coops, addCoop, updateCoop, deleteCoop } = useCoops();
  const { user } = useAuth();
  const [showAdd, setShowAdd] = useState(false);
  const [filterTerm, setFilterTerm] = useState<Term | 'All'>('All');
  const [filterYear, setFilterYear] = useState<number | 'All'>('All');
  const [search, setSearch] = useState('');

  const handleAdd = (data: typeof emptyForm) => {
    addCoop(data);
    toast.success(`Added ${data.brotherName}'s co-op at ${data.company}`);
    setShowAdd(false);
  };

  const filtered = coops.filter((c) => {
    if (filterTerm !== 'All' && c.term !== filterTerm) return false;
    if (filterYear !== 'All' && c.year !== filterYear) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        c.brotherName.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.position.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Group by term+year for display
  const grouped = filtered.reduce((acc, c) => {
    const key = `${c.term} ${c.year}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(c);
    return acc;
  }, {} as Record<string, CoopEntry[]>);

  // Sort groups: most recent first
  const sortedGroups = Object.entries(grouped).sort(([a], [b]) => {
    const [aTerm, aYear] = a.split(' ');
    const [bTerm, bYear] = b.split(' ');
    if (aYear !== bYear) return Number(bYear) - Number(aYear);
    return TERMS.indexOf(bTerm as Term) - TERMS.indexOf(aTerm as Term);
  });

  const availableYears = [...new Set(coops.map(c => c.year))].sort((a, b) => b - a);

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
                <h1 className="text-lg font-semibold flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Co-op Database
                </h1>
                <p className="text-sm text-muted-foreground">Brothers on co-op & internships</p>
              </div>
            </div>
            {user && (
              <Button size="sm" onClick={() => setShowAdd(true)}>
                <Plus className="h-4 w-4 mr-1" /> Add Entry
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-6">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="bg-card rounded-2xl border border-border p-5">
            <p className="text-3xl font-semibold">{coops.length}</p>
            <p className="text-sm text-muted-foreground mt-1">Total entries</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-5">
            <p className="text-3xl font-semibold">{new Set(coops.map(c => c.company)).size}</p>
            <p className="text-sm text-muted-foreground mt-1">Companies</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-5">
            <p className="text-3xl font-semibold">{new Set(coops.map(c => `${c.term} ${c.year}`)).size}</p>
            <p className="text-sm text-muted-foreground mt-1">Terms represented</p>
          </div>
        </div>

        {/* Add form */}
        {showAdd && (
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add Co-op Entry
            </h2>
            <CoopForm
              onSubmit={handleAdd}
              onCancel={() => setShowAdd(false)}
              submitLabel="Add Entry"
            />
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search brothers, companies..."
              className="w-full h-10 pl-4 pr-4 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <div className="flex gap-1 p-1 bg-muted/50 rounded-xl">
            {(['All', ...TERMS] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterTerm(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterTerm === t ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          {availableYears.length > 1 && (
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value === 'All' ? 'All' : Number(e.target.value))}
              className="h-9 px-3 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="All">All years</option>
              {availableYears.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          )}
        </div>

        {/* Entries */}
        {coops.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Briefcase className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No co-ops yet</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm">
              {user
                ? 'Be the first to add a co-op entry using the "Add Entry" button above.'
                : 'Sign in to add co-op entries for your brothers.'}
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">No entries match your filters.</div>
        ) : (
          <div className="space-y-8">
            {sortedGroups.map(([groupKey, entries]) => (
              <div key={groupKey}>
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <h2 className="font-semibold text-base">{groupKey}</h2>
                  <span className="text-xs text-muted-foreground">
                    {entries.length} brother{entries.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {entries.map((entry) => (
                    <CoopCard
                      key={entry.id}
                      entry={entry}
                      canEdit={!!user}
                      onDelete={() => {
                        deleteCoop(entry.id);
                        toast.success('Entry removed');
                      }}
                      onUpdate={(updates) => {
                        updateCoop(entry.id, updates);
                        toast.success('Entry updated');
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
