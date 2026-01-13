import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Coop } from "@/lib/api/types";
import { User, Calendar, Briefcase } from "lucide-react";

interface CoopCardProps {
  coop: Coop;
}

export function CoopCard({ coop }: CoopCardProps) {
  return (
    <Card className="group hover:shadow-md transition-all duration-200 border-border/50 hover:border-primary/30">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <User className="h-4 w-4 text-primary shrink-0" />
              <span className="font-medium text-foreground truncate">
                {coop.brotherName}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Briefcase className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{coop.position}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 shrink-0" />
              <span>{coop.semester}</span>
            </div>
          </div>
          <Badge
            variant={coop.status === "current" ? "default" : "secondary"}
            className={
              coop.status === "current"
                ? "bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20"
                : "bg-muted text-muted-foreground"
            }
          >
            <span
              className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
                coop.status === "current" ? "bg-green-500" : "bg-muted-foreground"
              }`}
            />
            {coop.status === "current" ? "Current" : "Past"}
          </Badge>
        </div>
        {coop.notes && (
          <p className="mt-3 text-xs text-muted-foreground line-clamp-2 border-t border-border/50 pt-3">
            {coop.notes}
          </p>
        )}
      </CardContent>
    </Card>
  );
}