import { useParams, useNavigate } from "react-router-dom";
import { useLead } from "@/hooks/useLeads";
import { usePipeline, useUpsertPipeline } from "@/hooks/usePipeline";
import TopBar from "@/components/layout/TopBar";
import DocumentsSection from "@/components/leads/DocumentsSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Phone, Mail, MapPin, Calendar } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Constants } from "@/integrations/supabase/types";

export default function LeadDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: lead, isLoading } = useLead(id!);
  const { data: pipeline } = usePipeline(id!);
  const upsertPipeline = useUpsertPipeline();
  const { toast } = useToast();

  const [stage, setStage] = useState<string>("");
  const [followUpDate, setFollowUpDate] = useState("");

  // Sync pipeline data
  useState(() => {
    if (pipeline) {
      if (pipeline.stage) setStage(pipeline.stage);
      setFollowUpDate(pipeline.follow_up_date || "");
    }
  });

  const handleSavePipeline = async () => {
    if (!stage) return;
    try {
      await upsertPipeline.mutateAsync({
        lead_id: id!,
        stage: stage as any,
        follow_up_date: followUpDate || null,
      });
      toast({ title: "Pipeline saved" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex flex-col items-center py-16 text-muted-foreground">
        <p>Lead not found.</p>
        <Button variant="link" onClick={() => navigate("/leads")}>Back to Leads</Button>
      </div>
    );
  }

  const currentStage = stage || pipeline?.stage || "";

  return (
    <div className="space-y-6">
      <TopBar
        title={lead.name}
        actions={
          <Button variant="outline" onClick={() => navigate("/leads")}>
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
              <Calendar className="h-4 w-4 text-muted-foreground" /><span>{format(new Date(lead.created_at), "PPp")}</span>
            </div>
            <div className="flex gap-2 pt-2">
              <Badge variant={lead.status === "Interested" ? "default" : "secondary"} style={{
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

        {/* Pipeline Section - only if Interested */}
        {lead.status === "Interested" && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Pipeline Stage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Stage</Label>
                <Select value={currentStage} onValueChange={setStage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Pipeline Stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {Constants.public.Enums.pipeline_stage.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {currentStage === "Follow Up" && (
                <div className="space-y-2">
                  <Label>Follow-up Date</Label>
                  <Input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} />
                </div>
              )}

              <Button onClick={handleSavePipeline} disabled={upsertPipeline.isPending || !stage} className="w-full">
                Save Pipeline
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Documents Section - below both, centered */}
      {lead.status === "Interested" && (
        <DocumentsSection leadId={lead.id} insuranceType={lead.insurance_type} />
      )}
    </div>
  );
}
