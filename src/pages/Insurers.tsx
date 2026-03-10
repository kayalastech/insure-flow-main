import { useState, useMemo } from "react";
import TopBar from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, ExternalLink, Building2, Pencil, Search } from "lucide-react";
import { useInsurers, useCreateInsurer, useUpdateInsurer, Insurer } from "@/hooks/useInsurers";
import { useToast } from "@/hooks/use-toast";

const emptyForm = { name: "", code: "", portal_url: "", is_active: "" };

export default function Insurers() {
  const { data: insurers, isLoading } = useInsurers();
  const createInsurer = useCreateInsurer();
  const updateInsurer = useUpdateInsurer();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingInsurer, setEditingInsurer] = useState<Insurer | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);

  const filteredInsurers = useMemo(() => {
    if (!insurers) return [];
    let result = insurers;
    if (activeOnly) result = result.filter((i) => i.is_active);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (i) => i.name.toLowerCase().includes(q) || i.code.toLowerCase().includes(q)
      );
    }
    return result;
  }, [insurers, search, activeOnly]);

  const openCreate = () => {
    setEditingInsurer(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (ins: Insurer) => {
    setEditingInsurer(ins);
    setForm({
      name: ins.name,
      code: ins.code,
      portal_url: ins.portal_url || "",
      is_active: ins.is_active ? "active" : "inactive",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim() || !form.is_active) {
      toast({ title: "Validation Error", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }
    try {
      if (editingInsurer) {
        await updateInsurer.mutateAsync({
          id: editingInsurer.id,
          name: form.name.trim(),
          code: form.code.trim(),
          portal_url: form.portal_url.trim() || null,
          is_active: form.is_active === "active",
        });
        toast({ title: "Insurer updated successfully" });
      } else {
        await createInsurer.mutateAsync({
          name: form.name.trim(),
          code: form.code.trim(),
          portal_url: form.portal_url.trim() || undefined,
          is_active: form.is_active === "active",
        });
        toast({ title: "Insurer added successfully" });
      }
      setDialogOpen(false);
      setForm(emptyForm);
      setEditingInsurer(null);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const isPending = createInsurer.isPending || updateInsurer.isPending;

  return (
    <div className="space-y-6">
      <TopBar
        title="Insurers"
        subtitle="Manage your insurance provider relationships"
      /*actions={
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />Add Insurer
          </Button>
        }*/ 
      />

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="active-only"
            checked={activeOnly}
            onCheckedChange={(v) => setActiveOnly(!!v)}
          />
          <Label htmlFor="active-only" className="text-sm cursor-pointer">Show Active Only</Label>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-40 rounded-lg" />)}
        </div>
      ) : filteredInsurers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-card py-20 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground/40 mb-3" />
          <p className="text-lg font-medium text-muted-foreground">
            {insurers && insurers.length > 0 ? "No Insurers Found" : "No Insurers Yet"}
          </p>
          <p className="text-sm text-muted-foreground">
            {insurers && insurers.length > 0
              ? "Try adjusting your search or filters."
              : "Add your first insurer to get started."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredInsurers.map((ins) => (
            <Card key={ins.id} className="shadow-card">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{ins.name}</h3>
                    <p className="text-xs text-muted-foreground">Code: {ins.code}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {/*<Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEdit(ins)}
                      title="Edit insurer"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>*/}
                    <Badge style={{backgroundColor: ins.is_active ? "rgb(36, 195, 1)" : "hsla(0, 97%, 50%, 1.00)"}}>
                      {ins.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
                {ins.portal_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => window.open(ins.portal_url!, "_blank")}
                  >
                    <ExternalLink className="mr-2 h-3 w-3" />Open Portal
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingInsurer(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingInsurer ? "Edit Insurer" : "Add Insurer"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Insurer Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required maxLength={100} placeholder="Enter insurer name" />
            </div>
            <div className="space-y-2">
              <Label>Insurer Code *</Label>
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required maxLength={20} placeholder="Enter insurer code" />
            </div>
            <div className="space-y-2">
              <Label>Insurer Status *</Label>
              <Select value={form.is_active} onValueChange={(v) => setForm({ ...form, is_active: v })}>
                <SelectTrigger><SelectValue placeholder="Select Insurer Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Portal URL</Label>
              <Input value={form.portal_url} onChange={(e) => setForm({ ...form, portal_url: e.target.value })} maxLength={500} placeholder="https://..." type="url" />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : editingInsurer ? "Update" : "Save"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
