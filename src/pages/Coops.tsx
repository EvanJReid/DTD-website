import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Building2, Users, Search, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useCoops } from "@/hooks/useDatabase";
import { AddCoopModal, CoopFormData } from "@/components/AddCoopModal";
import { CoopCard } from "@/components/CoopCard";
import { ChevronDown } from "lucide-react";

const Coops = () => {
  const { coopsByCompany, loading, addCoop } = useCoops();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set());

  const handleAddCoop = async (data: CoopFormData) => {
    await addCoop(data);
  };

  const toggleCompany = (company: string) => {
    setExpandedCompanies((prev) => {
      const next = new Set(prev);
      if (next.has(company)) {
        next.delete(company);
      } else {
        next.add(company);
      }
      return next;
    });
  };

  // Filter companies by search query
  const filteredCompanies = coopsByCompany.filter(({ company, coops }) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      company.toLowerCase().includes(query) ||
      coops.some(
        (c) =>
          c.brotherName.toLowerCase().includes(query) ||
          c.position.toLowerCase().includes(query)
      )
    );
  });

  const totalCoops = coopsByCompany.reduce((sum, { count }) => sum + count, 0);
  const currentCoops = coopsByCompany.reduce(
    (sum, { coops }) => sum + coops.filter((c) => c.status === "current").length,
    0
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b">
        <div className="container mx-auto px-6">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon" className="shrink-0">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-semibold">Co-op Database</h1>
                <p className="text-xs text-muted-foreground">
                  Where brothers have worked
                </p>
              </div>
            </div>
            <Button onClick={() => setIsModalOpen(true)} size="sm">
              <Plus className="h-4 w-4" />
              Add Co-op
            </Button>
          </div>
        </div>
      </header>

      {/* Stats */}
      <section className="border-b bg-muted/30">
        <div className="container mx-auto px-6 py-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{coopsByCompany.length}</p>
                <p className="text-xs text-muted-foreground">Companies</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalCoops}</p>
                <p className="text-xs text-muted-foreground">Total Co-ops</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{currentCoops}</p>
                <p className="text-xs text-muted-foreground">Currently Active</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search */}
      <section className="container mx-auto px-6 py-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by company, brother, or position..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </section>

      {/* Company List */}
      <section className="container mx-auto px-6 pb-16">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">
              {searchQuery ? "No matching results" : "No co-ops yet"}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm">
              {searchQuery
                ? "Try adjusting your search terms."
                : "Be the first to add your co-op experience!"}
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsModalOpen(true)} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add Co-op
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCompanies.map(({ company, coops, count }) => {
              const isExpanded = expandedCompanies.has(company);
              const currentCount = coops.filter((c) => c.status === "current").length;

              return (
                <Collapsible
                  key={company}
                  open={isExpanded}
                  onOpenChange={() => toggleCompany(company)}
                >
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {company}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {count} {count === 1 ? "brother" : "brothers"}
                            {currentCount > 0 && (
                              <span className="text-green-600">
                                {" "}
                                • {currentCount} current
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="text-sm">
                          {count}
                        </Badge>
                        <ChevronDown
                          className={`h-5 w-5 text-muted-foreground transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="grid gap-3 pt-3 pl-4 md:grid-cols-2 lg:grid-cols-3">
                      {coops
                        .sort((a, b) => {
                          // Current first, then by semester (newest first)
                          if (a.status !== b.status) {
                            return a.status === "current" ? -1 : 1;
                          }
                          return b.semester.localeCompare(a.semester);
                        })
                        .map((coop) => (
                          <CoopCard key={coop.id} coop={coop} />
                        ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        )}
      </section>

      <AddCoopModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddCoop}
      />
    </div>
  );
};

export default Coops;