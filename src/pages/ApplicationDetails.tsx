import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUpdateApplicationStatus } from "@/hooks/usePipelineLeads";
import { useLeadDocuments } from "@/hooks/useLeadDocuments";
import TopBar from "@/components/layout/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowLeft, Phone, Mail, MapPin, FileText, CheckCircle, XCircle, PauseCircle, Pencil, Building2, Save, Loader2, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

type InsuranceInfo = {
  insurance_company_name: string;
  sum_insured: string;
  premium_amount: string;
  policy_type: string;
  policy_tenure: string;
  policy_start_date: Date | undefined;
  policy_end_date: Date | undefined;
  commission_amount: string;
};

const emptyInsurance: InsuranceInfo = {
  insurance_company_name: "",
  sum_insured: "",
  premium_amount: "",
  policy_type: "",
  policy_tenure: "",
  policy_start_date: undefined,
  policy_end_date: undefined,
  commission_amount: "",
};


export default function ApplicationDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const updateStatus = useUpdateApplicationStatus();
  const qc = useQueryClient();

  const { data: pipeline, isLoading } = useQuery({
    queryKey: ["pipeline-detail", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pipeline")
        .select("*, leads(*)")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data as any;
    },
    enabled: !!user && !!id,
  });

  const lead = pipeline?.leads;
  const { data: documents } = useLeadDocuments(lead?.id || "");

  const [insuranceForm, setInsuranceForm] = useState<InsuranceInfo>(emptyInsurance);
  const [isEditing, setIsEditing] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);

  // Pre-fill form when pipeline data loads
  useEffect(() => {
    if (pipeline) {
      const hasData = !!pipeline.insurance_company_name;
      setHasSaved(hasData);
      setIsEditing(!hasData);
      setInsuranceForm({
        insurance_company_name: pipeline.insurance_company_name || "",
        sum_insured: pipeline.sum_insured?.toString() || "",
        premium_amount: pipeline.premium_amount?.toString() || "",
        policy_type: pipeline.policy_type || "",
        policy_tenure: pipeline.policy_tenure || "",
        policy_start_date: pipeline.policy_start_date ? new Date(pipeline.policy_start_date) : undefined,
        policy_end_date: pipeline.policy_end_date ? new Date(pipeline.policy_end_date) : undefined,
        commission_amount: pipeline.commission_amount?.toString() || "",
      });
    }
  }, [pipeline]);

  const saveInsurance = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("pipeline")
        .update({
          insurance_company_name: insuranceForm.insurance_company_name || null,
          sum_insured: insuranceForm.sum_insured ? Number(insuranceForm.sum_insured) : null,
          premium_amount: insuranceForm.premium_amount ? Number(insuranceForm.premium_amount) : null,
          policy_type: insuranceForm.policy_type || null,
          policy_tenure: insuranceForm.policy_tenure || null,
          policy_start_date: insuranceForm.policy_start_date ? format(insuranceForm.policy_start_date, "yyyy-MM-dd") : null,
          policy_end_date: insuranceForm.policy_end_date ? format(insuranceForm.policy_end_date, "yyyy-MM-dd") : null,
          commission_amount: insuranceForm.commission_amount ? Number(insuranceForm.commission_amount) : null,
          updated_at: new Date().toISOString(),
        } as any)
        .eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pipeline-detail", id] });
      setIsEditing(false);
      setHasSaved(true);
      toast({ title: "Insurance info saved successfully" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  
  const handleStatusChange = async (status: string) => {
    try {
      await updateStatus.mutateAsync({ pipelineId: id!, status });
      toast({ title: `Application marked as ${status}` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const updateField = (field: keyof InsuranceInfo, value: any) => {
    setInsuranceForm((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  if (!pipeline || !lead) {
    return (
      <div className="flex flex-col items-center py-16 text-muted-foreground">
        <p>Application not found.</p>
        <Button variant="link" onClick={() => navigate("/application-pipeline")}>Back</Button>
      </div>
    );
  }

  const statusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
    Pending: "outline",
    Approved: "default",
    Rejected: "destructive",
    "On Hold": "secondary",
  };

  return (
    <div className="space-y-6">
      <TopBar
        title={lead.name}
        subtitle="Application Details"
        actions={
          <Button variant="outline" onClick={() => navigate("/application-pipeline")}>
            <ArrowLeft className="mr-2 h-4 w-4" />Back
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Lead Info */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Lead Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" /><span>{lead.phone}</span>
            </div>
            {lead.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" /><span>{lead.email}</span>
              </div>
            )}
            {lead.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" /><span>{lead.location}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" /><span>{format(new Date(lead.created_at), "PPp")}</span>
            </div>
            <div className="flex gap-2 pt-2">
              <Badge variant="default" style={{
      color: "white",
      backgroundColor: {
        Interested: "hsla(198, 88%, 49%, 1.00)",
        }[lead.status] ?? "hsla(0, 97%, 50%, 1.00)",
    }}>{lead.status}</Badge>
              <Badge variant="outline" className="text-xs" style={{
      backgroundColor: {
        Life:    "hsla(283, 83%, 72%, 1.00)",
        Vehicle: "hsla(38, 90%, 59%, 1.00)",
        General: "hsla(174, 98%, 51%, 1.00)",
        Health:  "hsla(109, 90%, 49%, 1.00)",
      }[lead.insurance_type] ?? "hsl(240 4% 70%)",
    }}>{lead.insurance_type}</Badge>
            </div>
            {lead.remarks && (
              <div className="pt-2">
                <p className="text-xs font-medium text-muted-foreground mb-1">Remarks</p>
                <p className="text-sm">{lead.remarks}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Application Status */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Application Status</CardTitle>
              <Badge variant={statusVariant[pipeline.application_status] || "outline"} className="text-sm">
                {pipeline.application_status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Update the application status:</p>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => handleStatusChange("Approved")}
                disabled={updateStatus.isPending || pipeline.application_status === "Approved"}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <CheckCircle className="mr-2 h-4 w-4" />Approved
              </Button>
              <Button
                onClick={() => handleStatusChange("Rejected")}
                disabled={updateStatus.isPending || pipeline.application_status === "Rejected"}
                variant="destructive"
              >
                <XCircle className="mr-2 h-4 w-4" />Rejected
              </Button>
              <Button
                onClick={() => handleStatusChange("On Hold")}
                disabled={updateStatus.isPending || pipeline.application_status === "On Hold"}
                variant="secondary"
              >
                <PauseCircle className="mr-2 h-4 w-4" />On Hold
              </Button>
            </div>

            {/* Documents */}
            {documents && documents.length > 0 && (
              <div className="border-t pt-4 space-y-2">
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4" />Uploaded Documents
                </p>
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-2 rounded-md border p-2 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate flex-1">{doc.document_name}</span>
                    <span className="text-xs text-muted-foreground">{format(new Date(doc.created_at!), "PP")}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Insurance Info Card */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Insurance Info
            </CardTitle>
            {hasSaved && !isEditing && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Pencil className="mr-2 h-4 w-4" />Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Insurance Company Name</Label>
              <Input
                value={insuranceForm.insurance_company_name}
                onChange={(e) => updateField("insurance_company_name", e.target.value)}
                disabled={!isEditing}
                placeholder="Enter company name"
              />
            </div>
            <div className="space-y-2">
              <Label>Sum Insured</Label>
              <Input
                type="number"
                value={insuranceForm.sum_insured}
                onChange={(e) => updateField("sum_insured", e.target.value)}
                disabled={!isEditing}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label>Premium Amount</Label>
              <Input
                type="number"
                value={insuranceForm.premium_amount}
                onChange={(e) => updateField("premium_amount", e.target.value)}
                disabled={!isEditing}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label>Policy Type</Label>
              <Input
                value={insuranceForm.policy_type}
                onChange={(e) => updateField("policy_type", e.target.value)}
                disabled={!isEditing}
                placeholder="e.g. Term, Endowment"
              />
            </div>
            <div className="space-y-2">
              <Label>Policy Tenure (in Year)</Label>
              <Input
                value={insuranceForm.policy_tenure}
                onChange={(e) => updateField("policy_tenure", e.target.value)}
                disabled={!isEditing}
                placeholder="e.g. 1 Year, 5 Years"
              />
            </div>
            <div className="space-y-2">
              <Label>Policy Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={!isEditing}
                    className={cn("w-full justify-start text-left font-normal", !insuranceForm.policy_start_date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {insuranceForm.policy_start_date ? format(insuranceForm.policy_start_date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={insuranceForm.policy_start_date} onSelect={(d) => updateField("policy_start_date", d)} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Policy End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={!isEditing}
                    className={cn("w-full justify-start text-left font-normal", !insuranceForm.policy_end_date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {insuranceForm.policy_end_date ? format(insuranceForm.policy_end_date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={insuranceForm.policy_end_date} onSelect={(d) => updateField("policy_end_date", d)} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Commission Amount</Label>
              <Input
                type="number"
                value={insuranceForm.commission_amount}
                onChange={(e) => updateField("commission_amount", e.target.value)}
                disabled={!isEditing}
                placeholder="0"
              />
            </div>
          </div>

          {isEditing && (
            <div className="mt-6 flex justify-end">
              <Button onClick={() => saveInsurance.mutate()} disabled={saveInsurance.isPending}>
                {saveInsurance.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
                ) : (
                  <><Save className="mr-2 h-4 w-4" />Save</>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>        
      
    </div>
  );
}
