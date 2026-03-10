import { useState, useMemo } from "react";
import TopBar from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, LayoutGrid, List, Search } from "lucide-react";
import { useLeads, Lead } from "@/hooks/useLeads";
import LeadCard from "@/components/leads/LeadCard";
import LeadTable from "@/components/leads/LeadTable";
import LeadDialog from "@/components/leads/LeadDialog";
import { Constants } from "@/integrations/supabase/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { useInsuranceTypes } from "@/hooks/useInsuranceTypes";

export default function Leads() {
  const { data: leads, isLoading } = useLeads();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [view, setView] = useState<"card" | "table">("table");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showNotInterested, setShowNotInterested] = useState(false);
  const { data: insuranceTypes } = useInsuranceTypes();

  const filtered = useMemo(() => {
    if (!leads) return [];
    return leads.filter((l) => {
      const matchesSearch = !search || l.name.toLowerCase().includes(search.toLowerCase()) || l.phone.includes(search);
      const matchesType = typeFilter === "All" || l.insurance_type === typeFilter;
      const matchesStatus = statusFilter === "All" || l.status === statusFilter;
      //const matchesNotInterested = !showNotInterested || l.status === "Not Interested";
      const matchesNotInterested = showNotInterested ? l.status === "Not Interested" : l.status !== "Not Interested";
      return matchesSearch && matchesType && matchesStatus && matchesNotInterested;
    });
  }, [leads, search, typeFilter, statusFilter, showNotInterested]);

  const handleEdit = (lead: Lead) => {
    setEditLead(lead);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <TopBar
        title="Leads"
        actions={
          <Button onClick={() => { setEditLead(null); setDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />Add Lead
          </Button> 
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name or phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue /><SelectValue placeholder="All Types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Types</SelectItem>
            {insuranceTypes?.map((t) => (
              <SelectItem key={t.id} value={t.insurance_type_name}>{t.insurance_type_name}</SelectItem>
            )) ?? Constants.public.Enums.insurance_type.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Status</SelectItem>
            {Constants.public.Enums.lead_status.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="not-interested"
              checked={showNotInterested}
              onCheckedChange={(checked) => setShowNotInterested(checked === true)}
            />
            <label htmlFor="not-interested" className="text-sm text-muted-foreground cursor-pointer whitespace-nowrap">
              Show Not Interested
            </label>
          </div>
          <div className="flex rounded-lg border bg-card p-0.5">
            <Button variant={view === "card" ? "default" : "ghost"} size="sm" onClick={() => setView("card")} className="h-8 px-3">
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button variant={view === "table" ? "default" : "ghost"} size="sm" onClick={() => setView("table")} className="h-8 px-3">
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48 rounded-lg" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-card py-16 text-center">
          <p className="text-lg font-medium text-muted-foreground">No leads found</p>
          <p className="text-sm text-muted-foreground">Add your first lead to get started.</p>
        </div>
      ) : view === "card" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((lead) => <LeadCard key={lead.id} lead={lead} onEdit={handleEdit} />)}
        </div>
      ) : (
        <LeadTable leads={filtered} onEdit={handleEdit} />
      )}

      <LeadDialog open={dialogOpen} onOpenChange={setDialogOpen} lead={editLead} />
    </div>
  );
}
