import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const prescriptions = [
  {
    id: "RX78901",
    patient: "John Doe",
    medication: "Lisinopril",
    status: "Reviewed",
    date: "2023-10-26",
  },
  {
    id: "RX78902",
    patient: "Jane Smith",
    medication: "Metformin",
    status: "Pending",
    date: "2023-10-25",
  },
  {
    id: "RX78903",
    patient: "Sam Brown",
    medication: "Amoxicillin",
    status: "Reviewed",
    date: "2023-10-24",
  },
  {
    id: "RX78904",
    patient: "Lisa White",
    medication: "Atorvastatin",
    status: "Flagged",
    date: "2023-10-23",
  },
];

export default function PrescriptionsPage() {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Reviewed":
        return "default";
      case "Pending":
        return "secondary";
      case "Flagged":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Reviewed":
        return "bg-accent text-accent-foreground";
      default:
        return "";
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <DashboardHeader title="Prescriptions" />
        <Button>Add Prescription</Button>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Medication</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prescriptions.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.id}</TableCell>
                <TableCell>{p.patient}</TableCell>
                <TableCell>{p.medication}</TableCell>
                <TableCell>
                  <Badge
                    variant={getStatusVariant(p.status)}
                    className={getStatusClass(p.status)}
                  >
                    {p.status}
                  </Badge>
                </TableCell>
                <TableCell>{p.date}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Review</DropdownMenuItem>
                      <DropdownMenuItem>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
