import { Lead } from "@/hooks/useLeads";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LeadTableProps {
  leads: Lead[];
  onEdit: (lead: Lead) => void;
}

export default function LeadTable({ leads, onEdit }: LeadTableProps) {
  const navigate = useNavigate();

  return (
    <div className="rounded-lg border bg-card shadow-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Lead Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Insurance Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id} className="cursor-pointer" onClick={() => navigate(`/leads/${lead.id}`)}>
              <TableCell className="font-medium">{lead.name}</TableCell>
              <TableCell>{lead.phone}</TableCell>
              <TableCell>{lead.email || "—"}</TableCell>
              <TableCell>{lead.location || "—"}</TableCell>
              <TableCell><Badge variant="outline" className="text-xs" style={{
      backgroundColor: {
        Life:    "hsla(283, 83%, 72%, 1.00)",
        Vehicle: "hsla(38, 90%, 59%, 1.00)",
        General: "hsla(174, 98%, 51%, 1.00)",
        Health:  "hsla(109, 90%, 49%, 1.00)",
      }[lead.insurance_type] ?? "hsl(240 4% 70%)",
    }}>{lead.insurance_type}</Badge></TableCell>
              <TableCell>
                <Badge variant={lead.status === "Interested" ? "default" : "secondary"} style={{
      color: "white",
      backgroundColor: {
        Interested: "hsla(198, 88%, 49%, 1.00)",
        }[lead.status] ?? "hsla(0, 97%, 50%, 1.00)",
    }}>{lead.status}</Badge>
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
