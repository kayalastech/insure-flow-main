import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "@/components/layout/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, FileText, Clock, CheckCircle, ArrowRight, Phone, XCircle } from "lucide-react";
import { useLeads } from "@/hooks/useLeads";
import { usePipelineLeads } from "@/hooks/usePipelineLeads";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

import { format } from "date-fns";

const PIE_COLORS = [
  "hsla(283, 83%, 72%, 1.00)",
  "hsla(38, 90%, 59%, 1.00)",
  "hsla(174, 98%, 51%, 1.00)",
  "hsla(109, 90%, 49%, 1.00)",
];

export default function Dashboard() {
  const { data: leads, isLoading } = useLeads();
  const { data: pipelineLeads, isLoading: isPipelineLoading } = usePipelineLeads();
  const navigate = useNavigate();

  const stats = useMemo(() => {
    if (!leads) return null;
    const total = leads.length;
    const interested = leads.filter((l) => l.status === "Interested").length;
    const notInterested = leads.filter((l) => l.status === "Not Interested").length;
    const followUp = pipelineLeads?.filter((l) => l.stage === "Follow Up").length || 0;
    const partial = pipelineLeads?.filter((l) => l.stage === "Partial Docs Submitted").length || 0;
    const submitted = pipelineLeads?.filter((l) => l.stage === "Submitted").length || 0;
    const approvals = pipelineLeads?.filter((l) => l.application_status === "Approved").length || 0;
    const rejected = pipelineLeads?.filter((l) => l.application_status === "Rejected").length || 0;
    
    return {
      totalLeads: total,
      totalSubmissions: interested,
      totalNotInterested: notInterested,
      totalFollowUp: followUp,
      totalPartial: partial,
      totalSubmitted: submitted,
      approvals: approvals,
      rejected: rejected,
    };
  }, [leads, pipelineLeads]);

  const pipelineData = useMemo(() => {
    if (!leads) return [];
    const interested = leads.filter((l) => l.status === "Interested").length;
    const notInterested = leads.filter((l) => l.status === "Not Interested").length;
    const total = leads.length || 1;
    //const followUp = pipelineLeads?.filter((l) => l.stage === "Follow Up").length || 0;
    //const partial = pipelineLeads?.filter((l) => l.stage === "Partial Docs Submitted").length || 0;
    //const submitted = pipelineLeads?.filter((l) => l.stage === "Submitted").length || 0;

    return [
      { name: "Interested", count: interested, pct: Math.round((interested / total) * 100) },
      { name: "Not Interested", count: notInterested, pct: Math.round((notInterested / total) * 100) },
      //{ name: "Follow Up", count: followUp, pct: Math.round((followUp / total) * 100) },
      //{ name: "Partial Docs", count: partial, pct: Math.round((partial / total) * 100) },
      //{ name: "Submitted", count: submitted, pct: Math.round((submitted / total) * 100) },
    ];
  }, [leads, pipelineLeads]);
  
  const insuranceData = useMemo(() => {
    if (!leads) return [];
    const counts: Record<string, number> = {};
    leads.forEach((l) => {
      counts[l.insurance_type] = (counts[l.insurance_type] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [leads]);

  const recentLeads = useMemo(() => leads?.slice(0, 4) || [], [leads]);

  const statCards = stats
    ? [
        { label: "Total Leads", value: stats.totalLeads, icon: Users, color: "text-primary", bg: "bg-sky-100" },
        { label: "Interested Leads", value: stats.totalSubmissions, icon: FileText, color: "text-accent", bg: "bg-green-100" },
        { label: "Not Interested Leads", value: stats.totalNotInterested, icon: XCircle, color: "text-destructive", bg: "bg-red-100" },
        { label: "Follow Up Leads", value: stats.totalFollowUp, icon: Clock, color: "text-warning", bg: "bg-orange-100" },
        { label: "Partial Docs Leads", value: stats.totalPartial, icon: Clock, color: "text-warning", bg: "bg-amber-100" },
        { label: "Submitted Leads", value: stats.totalSubmitted, icon: CheckCircle, color: "text-success", bg: "bg-purple-100" },
        { label: "Approved Leads", value: stats.approvals, icon: CheckCircle, color: "text-success", bg: "bg-emerald-100" },
        { label: "Rejected Leads", value: stats.rejected, icon: XCircle, color: "text-destructive", bg: "bg-rose-100" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <TopBar title="Dashboard" subtitle="Overview of your insurance leads and pipelines" />

      {/* Stats */}
      {isLoading || isPipelineLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((s) => (
            <Card key={s.label} className={`rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 ${s.bg}`}>
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-white/70 backdrop-blur-sm ${s.color}`}>
                  <s.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
          <CardHeader>
            <CardTitle className="text-lg">Interest Status Overview</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipelineData} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={110} />
                  <Tooltip formatter={(value: number, _name: string, props: any) => [`${value} (${props.payload.pct}%)`, "Count"]} />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {pipelineData.map((entry, i) => (
                      <Cell
  key={i}
  fill={{
    Interested: "hsl(142, 71%, 45%)",
    "Not Interested": "hsl(0, 84%, 60%)",
    //"Follow Up": "hsl(25, 95%, 53%)",
    //"Partial Docs": "hsl(38, 92%, 50%)",
    //"Submitted": "hsl(271, 91%, 65%)",
  }[entry.name]}
/>
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
          <CardHeader>
            <CardTitle className="text-lg">Insurance Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {isLoading || isPipelineLoading ? (
              <Skeleton className="h-full w-full" />
            ) : insuranceData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-muted-foreground text-sm">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={insuranceData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} label={({ name, value }) => `${name}: ${value}`}paddingAngle={2}>
                    {insuranceData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Leads */}
      <Card className="rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Recent Leads</CardTitle>
          <Button variant="link" className="text-sm" onClick={() => navigate("/leads")}>
            View All <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading || isPipelineLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16" />)}
            </div>
          ) : recentLeads.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground text-sm">No leads yet. Add your first lead to get started.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between rounded-lg border p-4 cursor-pointer transition-colors hover:bg-secondary/50"
                  onClick={() => navigate(`/leads/${lead.id}`)}
                >
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{lead.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" />{lead.phone}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline" className="text-xs" style={{
      backgroundColor: {
        Life:    "hsla(283, 83%, 72%, 1.00)",
        Vehicle: "hsla(38, 90%, 59%, 1.00)",
        General: "hsla(174, 98%, 51%, 1.00)",
        Health:  "hsla(109, 90%, 49%, 1.00)",
      }[lead.insurance_type] ?? "hsl(240 4% 70%)",
    }}>{lead.insurance_type}</Badge>
                    <Badge variant={lead.status === "Interested" ? "default" : "secondary"} className="text-xs" style={{
      color: "white",
      backgroundColor: {
        Interested: "hsla(198, 88%, 49%, 1.00)",
        }[lead.status] ?? "hsla(0, 97%, 50%, 1.00)",
    }}>{lead.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
