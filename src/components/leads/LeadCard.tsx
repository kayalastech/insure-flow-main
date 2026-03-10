import { Lead } from "@/hooks/useLeads";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, Calendar, MoreHorizontal, Pencil, Eye } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

interface LeadCardProps {
  lead: Lead;
  onEdit: (lead: Lead) => void;
}

export default function LeadCard({ lead, onEdit }: LeadCardProps) {
  const navigate = useNavigate();

  const insuranceColor = {
  Life:    "hsla(283, 83%, 72%, 1.00)",
  Vehicle: "hsla(38, 90%, 59%, 1.00)",
  General: "hsla(174, 98%, 51%, 1.00)",
  Health:  "hsla(109, 90%, 49%, 1.00)",
}[lead.insurance_type] ?? "hsl(0 0% 70%)";

  return (
    <Card
      className="cursor-pointer shadow-card transition-shadow hover:shadow-card-hover animate-fade-in"
      onClick={() => navigate(`/leads/${lead.id}`)}
    >
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-foreground">{lead.name}</h3>
          <div className="flex items-center gap-2">
            <Badge variant={lead.status === "Interested" ? "default" : "secondary"} className="text-xs" style={{
      color: "white",
      backgroundColor: {
        Interested: "hsla(198, 88%, 49%, 1.00)",
        }[lead.status] ?? "hsla(0, 97%, 50%, 1.00)",
    }}>
              {lead.status}
            </Badge>
            <div onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(lead)}>
                    <Pencil className="mr-2 h-4 w-4" />Edit Lead
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(`/leads/${lead.id}`)}>
                    <Eye className="mr-2 h-4 w-4" />View Details
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        <div className="space-y-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" />{lead.phone}</div>
          {lead.email && <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" />{lead.email}</div>}
          {lead.location && <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" />{lead.location}</div>}
          <div className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5" />{format(new Date(lead.created_at), "PPp")}</div>
        </div>
        <Badge variant="outline" className="text-xs" style={{ background: insuranceColor }}>{lead.insurance_type}</Badge>
      </CardContent>
    </Card>
  );
}
