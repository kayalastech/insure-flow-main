import { useState, useRef, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, Upload, Eye, RefreshCw, Loader2 } from "lucide-react";
import { DOCUMENT_REQUIREMENTS } from "@/lib/documentRequirements";
import { useLeadDocuments, useSaveLeadDocuments, LeadDocument } from "@/hooks/useLeadDocuments";
import { useToast } from "@/hooks/use-toast";

interface DocumentsSectionProps {
  leadId: string;
  insuranceType: string;
}

export default function DocumentsSection({ leadId, insuranceType }: DocumentsSectionProps) {
  const { data: existingDocs } = useLeadDocuments(leadId);
  const saveDocs = useSaveLeadDocuments();
  const { toast } = useToast();

  const [pendingFiles, setPendingFiles] = useState<Record<string, File>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [viewDoc, setViewDoc] = useState<{ name: string; url: string } | null>(null);

  const requirements = DOCUMENT_REQUIREMENTS[insuranceType] || [];
  const mandatory = requirements.filter((r) => r.isMandatory);
  const optional = requirements.filter((r) => !r.isMandatory);

  const existingDocMap = useMemo(() => {
    const map: Record<string, LeadDocument> = {};
    existingDocs?.forEach((doc) => {
      map[doc.document_name] = doc;
    });
    return map;
  }, [existingDocs]);

  const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB

  const handleFileSelect = (docName: string, file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({ title: "Invalid file type", description: "Only PDF, JPG, and PNG files are accepted.", variant: "destructive" });
      return;
    }
    if (file.size > MAX_SIZE) {
      toast({ title: "File too large", description: "Maximum file size is 5MB.", variant: "destructive" });
      return;
    }
    setPendingFiles((prev) => ({ ...prev, [docName]: file }));
  };

  const handleSaveAll = async () => {
    const filesToUpload = Object.entries(pendingFiles).map(([documentName, file]) => {
      const req = requirements.find((r) => r.name === documentName);
      return { documentName, file, isMandatory: req?.isMandatory ?? true };
    });

    if (filesToUpload.length === 0) {
      toast({ title: "No files selected", description: "Please select files to upload.", variant: "destructive" });
      return;
    }

    try {
      await saveDocs.mutateAsync({ leadId, files: filesToUpload, insuranceType });
      setPendingFiles({});
      toast({ title: "Documents saved successfully" });
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    }
  };

  const renderDocRow = (doc: { name: string; isMandatory: boolean }) => {
    const existing = existingDocMap[doc.name];
    const hasPending = !!pendingFiles[doc.name];
    const isUploaded = !!existing;

    return (
      <div key={doc.name} className="flex items-center justify-between rounded-md border p-3 gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="text-sm truncate">{doc.name}</span>
          {hasPending && (
            <Badge variant="outline" className="text-xs shrink-0 max-w-[140px] truncate">
              {pendingFiles[doc.name].name}
            </Badge>
          )}
          {!hasPending && isUploaded && (
            <Badge variant="secondary" className="text-xs shrink-0 max-w-[140px] truncate">
              Uploaded
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              if (isUploaded) {
                setViewDoc({ name: doc.name, url: existing.document_url });
              } else {
                toast({ title: "File not uploaded", description: "Please upload the document first.", variant: "destructive" });
              }
            }}
            title={isUploaded ? "View document" : "No file uploaded"}
          >
            <Eye className={cn("h-4 w-4", isUploaded ? "text-primary" : "text-muted-foreground/40")} />
          </Button>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            ref={(el) => { fileInputRefs.current[doc.name] = el; }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(doc.name, file);
              e.target.value = "";
            }}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRefs.current[doc.name]?.click()}
          >
            {isUploaded || hasPending ? (
              <><RefreshCw className="mr-1 h-3 w-3" />Replace</>
            ) : (
              <><Upload className="mr-1 h-3 w-3" />Upload</>
            )}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <>
      <Card className="shadow-card max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />Documents — {insuranceType} Insurance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {mandatory.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-foreground">Required Documents</h4>
              <div className="space-y-2">{mandatory.map(renderDocRow)}</div>
            </div>
          )}
          {optional.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground">Not Mandatory</h4>
              <div className="space-y-2">{optional.map(renderDocRow)}</div>
            </div>
          )}
          <Button
            onClick={handleSaveAll}
            disabled={saveDocs.isPending || Object.keys(pendingFiles).length === 0}
            className="w-full"
          >
            {saveDocs.isPending ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving Documents...</>
            ) : (
              <>Save Documents ({Object.keys(pendingFiles).length} selected)</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Document Viewer Dialog */}
      <Dialog open={!!viewDoc} onOpenChange={(open) => !open && setViewDoc(null)}>
        <DialogContent className="max-w-4xl w-[95vw] p-0">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>{viewDoc?.name}</DialogTitle>
          </DialogHeader>
          <div className="p-4 pt-2">
            <iframe
              src={viewDoc?.url}
              title={viewDoc?.name}
              className="w-full rounded-md border bg-muted"
              style={{ height: "80vh" }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
