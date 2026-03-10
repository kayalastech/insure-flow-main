import { useState } from "react";
import TopBar from "@/components/layout/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useInsuranceTypes, useCreateInsuranceType, useUpdateInsuranceType, useDeleteInsuranceType } from "@/hooks/useInsuranceTypes";
import { useInsurers, useCreateInsurer, useUpdateInsurer, Insurer, useDeleteInsurer } from "@/hooks/useInsurers";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth"; // ← make sure this hook exposes isLoading

export default function AdminSettings() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useUserRole();

  // Combined loading state – prevents flash/early redirect
  const isInitializing = authLoading || roleLoading || user === undefined;

  if (isInitializing) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center flex-col gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground">Checking permissions...</p>
      </div>
    );
  }

  // After loading finished – now safe to decide
  if (!isAdmin) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 p-8 text-center">
        <h2 className="text-2xl font-semibold text-destructive">Access Denied</h2>
        <p className="max-w-md text-muted-foreground">
          This section is restricted to administrators only.
          {user ? (
            <span className="block mt-2 text-sm">
              (You are logged in but do not have admin privileges)
            </span>
          ) : (
            <span className="block mt-2 text-sm">You appear to be not logged in.</span>
          )}
        </p>
        <Button asChild variant="outline">
          <a href="/">Return to Dashboard</a>
        </Button>
      </div>
    );
  }

  // Only render content when we are sure user is admin
  return (
    <div className="space-y-6">
      <TopBar title="Admin Settings" subtitle="Manage insurance types and insurers" />

      <div className="grid gap-6 lg:grid-cols-2">
        <InsuranceTypesSection />
        <InsurersSection />
      </div>
    </div>
  );
}

function InsuranceTypesSection() {
  const { data: types, isLoading } = useInsuranceTypes();
  const createType = useCreateInsuranceType();
  const updateType = useUpdateInsuranceType();
  const deleteType = useDeleteInsuranceType();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");

  const openCreate = () => {
    setEditingId(null);
    setName("");
    setDialogOpen(true);
  };

  const openEdit = (t: { id: string; insurance_type_name: string }) => {
    setEditingId(t.id);
    setName(t.insurance_type_name);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      if (editingId) {
        await updateType.mutateAsync({ id: editingId, name: name.trim() });
        toast({ title: "Insurance type updated" });
      } else {
        await createType.mutateAsync(name.trim());
        toast({ title: "Insurance type added" });
      }
      setDialogOpen(false);
      setName("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteType.mutateAsync(id);
      toast({ title: "Insurance type deleted" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg">Insurance Types</CardTitle>
        <Button size="sm" onClick={openCreate}>
          <Plus className="mr-1 h-4 w-4" /> Add
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : !types?.length ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No insurance types yet.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {types.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.insurance_type_name}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEdit(t)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDelete(t.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Insurance Type" : "Add Insurance Type"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Type Name *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Health, Life..."
                maxLength={50}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createType.isPending || updateType.isPending}>
                {editingId ? "Update" : "Save"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function InsurersSection() {
  const { data: insurers, isLoading } = useInsurers();
  const createInsurer = useCreateInsurer();
  const updateInsurer = useUpdateInsurer();
  const deleteInsurer = useDeleteInsurer();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Insurer | null>(null);
  const [form, setForm] = useState({
    name: "",
    code: "",
    portal_url: "",
    is_active: "active" as "active" | "inactive",
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", code: "", portal_url: "", is_active: "active" });
    setDialogOpen(true);
  };

  const openEdit = (ins: Insurer) => {
    setEditing(ins);
    setForm({
      name: ins.name,
      code: ins.code,
      portal_url: ins.portal_url || "",
      is_active: ins.is_active ? "active" : "inactive",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteInsurer.mutateAsync(id);
      toast({ title: "Insurer deleted" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) return;

    try {
      if (editing) {
        await updateInsurer.mutateAsync({
          id: editing.id,
          name: form.name.trim(),
          code: form.code.trim(),
          portal_url: form.portal_url.trim() || null,
          is_active: form.is_active === "active",
        });
        toast({ title: "Insurer updated" });
      } else {
        await createInsurer.mutateAsync({
          name: form.name.trim(),
          code: form.code.trim(),
          portal_url: form.portal_url.trim() || undefined,
          is_active: form.is_active === "active",
        });
        toast({ title: "Insurer added" });
      }
      setDialogOpen(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg">Insurers</CardTitle>
        <Button size="sm" onClick={openCreate}>
          <Plus className="mr-1 h-4 w-4" /> Add
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : !insurers?.length ? (
          <p className="text-sm text-muted-foreground text-center py-8">No insurers yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {insurers.map((ins) => (
                <TableRow key={ins.id}>
                  <TableCell className="font-medium">{ins.name}</TableCell>
                  <TableCell className="text-muted-foreground">{ins.code}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEdit(ins)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDelete(ins.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Insurer" : "Add Insurer"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                maxLength={100}
                placeholder="Insurer name"
              />
            </div>
            <div className="space-y-2">
              <Label>Code *</Label>
              <Input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                required
                maxLength={20}
                placeholder="Insurer code"
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.is_active}
                onValueChange={(v) => setForm({ ...form, is_active: v as "active" | "inactive" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Portal URL</Label>
              <Input
                value={form.portal_url}
                onChange={(e) => setForm({ ...form, portal_url: e.target.value })}
                maxLength={500}
                placeholder="https://..."
                type="url"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createInsurer.isPending || updateInsurer.isPending}
              >
                {editing ? "Update" : "Save"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}