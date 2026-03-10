import { useState, useMemo } from "react";
import TopBar from "@/components/layout/TopBar";
import { usePipelineLeads, PipelineWithLead } from "@/hooks/usePipelineLeads";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Constants } from "@/integrations/supabase/types";

const stages = Constants.public.Enums.pipeline_stage;

const stageStyles: Record<string, string> = {
  "Follow Up": "bg-amber-500 text-white hover:bg-amber-600",
  "Partial Docs Submitted": "bg-blue-500 text-white hover:bg-blue-600",
  "Submitted": "bg-emerald-500 text-white hover:bg-emerald-600",
};

const stageInactiveStyles: Record<string, string> = {
  "Follow Up": "border-amber-300 text-amber-700 hover:bg-amber-50",
  "Partial Docs Submitted": "border-blue-300 text-blue-700 hover:bg-blue-50",
  "Submitted": "border-emerald-300 text-emerald-700 hover:bg-emerald-50",
};

const insuranceColors: Record<string, string> = {
  Life: "hsla(283, 83%, 72%, 1.00)",
  Vehicle: "hsla(38, 90%, 59%, 1.00)",
  General: "hsla(174, 98%, 51%, 1.00)",
  Health: "hsla(109, 90%, 49%, 1.00)",
};

export default function SalesPipeline() {
  const [activeStage, setActiveStage] = useState<string>(stages[0] || "Follow Up");
  const [search, setSearch] = useState("");
  const { data: allPipeline, isLoading } = usePipelineLeads();
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    if (!allPipeline) return [];
    let items = allPipeline.filter((p) => p.stage === activeStage);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (p) =>
          p.leads.name.toLowerCase().includes(q) ||
          p.leads.phone.toLowerCase().includes(q)
      );
    }
    return items;
  }, [allPipeline, activeStage, search]);

  return (
    <div className="space-y-6">
      <TopBar title="Sales Pipeline" subtitle="Track and manage your sales pipeline stages" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          {stages.map((stage) => (
            <Button
              key={stage}
              variant="outline"
              size="sm"
              className={activeStage === stage ? stageStyles[stage] : stageInactiveStyles[stage]}
              onClick={() => { setActiveStage(stage); setSearch(""); }}
            >
              {stage}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border bg-card shadow-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lead Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Insurance Type</TableHead>
                <TableHead>Pipeline Stage</TableHead>
                <TableHead>FollowUp Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    No leads found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((item) => (
                  <TableRow
                    key={item.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/leads/${item.leads.id}`)}
                  >
                    <TableCell className="font-medium">{item.leads.name}</TableCell>
                    <TableCell>{item.leads.phone}</TableCell>
                    <TableCell>{item.leads.email || "—"}</TableCell>
                    <TableCell>{item.leads.location || "—"}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="text-xs"
                        style={{ backgroundColor: insuranceColors[item.leads.insurance_type] ?? "hsl(240 4% 70%)" }}
                      >
                        {item.leads.insurance_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs border ${stageInactiveStyles[item.stage] || ""}`}>
                        {item.stage}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.follow_up_date || "—"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
