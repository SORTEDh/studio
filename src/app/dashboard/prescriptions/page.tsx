
'use client';

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
import { MoreHorizontal, PlusCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {Prescription} from '@/lib/types';


export default function PrescriptionsPage() {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();

  const prescriptionsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, `users/${user.uid}/prescriptions`));
  }, [firestore, user]);

  const { data: prescriptions, isLoading } = useCollection<Prescription>(prescriptionsQuery);


  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Reviewed":
        return "default";
      case "Active":
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
      case "Active":
        return "bg-accent text-accent-foreground";
      default:
        return "";
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <DashboardHeader title="Prescriptions" />
        <Button asChild>
          <Link href="/dashboard/prescriptions/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Prescription
          </Link>
        </Button>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Medication</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Loading prescriptions...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && prescriptions?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No prescriptions found.
                </TableCell>
              </TableRow>
            )}
            {prescriptions?.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.id.substring(0, 7)}...</TableCell>
                <TableCell>{p.medicationName}</TableCell>
                <TableCell>
                  <Badge
                    variant={getStatusVariant(p.status)}
                    className={getStatusClass(p.status)}
                  >
                    {p.status}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(p.createdAt).toLocaleDateString()}</TableCell>
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
