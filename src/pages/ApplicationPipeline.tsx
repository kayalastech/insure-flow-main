import TopBar from "@/components/layout/TopBar";
import { usePipelineLeads } from "@/hooks/usePipelineLeads";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const statusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  Pending: "outline",
  Approved: "default",
  Rejected: "destructive",
  "On Hold": "secondary",
};

export default function ApplicationPipeline() {
  const { data: pipelines, isLoading } = usePipelineLeads("Submitted");
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <TopBar title="Application Pipeline" subtitle="Monitor submitted applications" />

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
        </div>
      ) : !pipelines || pipelines.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-card py-20 text-center">
          <p className="text-lg font-medium text-muted-foreground">No submitted applications</p>
          <p className="text-sm text-muted-foreground">Applications with "Submitted" stage will appear here.</p>
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
                <TableHead>Submitted On</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pipelines.map((p) => (
                <TableRow
                  key={p.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/application/${p.id}`)}
                >
                  <TableCell className="font-medium">{p.leads.name}</TableCell>
                  <TableCell>{p.leads.phone}</TableCell>
                  <TableCell>{p.leads.email}</TableCell>
                  <TableCell>{p.leads.location}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs" style={{
      backgroundColor: {
        Life:    "hsla(283, 83%, 72%, 1.00)",
        Vehicle: "hsla(38, 90%, 59%, 1.00)",
        General: "hsla(174, 98%, 51%, 1.00)",
        Health:  "hsla(109, 90%, 49%, 1.00)",
      }[p.leads.insurance_type] ?? "hsl(240 4% 70%)",
    }}>{p.leads.insurance_type}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{format(new Date(p.updated_at), "PP")}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[p.application_status] || "outline"}>
                      {p.application_status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
