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
import { collection, query } from "firebase/firestore";
import Link from "next/link";
import { CarePlan } from '@/lib/types';
import { useRouter } from "next/navigation";


export default function CarePlansPage() {
    const router = useRouter();
    const { user } = useUser();
    const firestore = useFirestore();

    const carePlansQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, `users/${user.uid}/carePlans`));
    }, [firestore, user]);
    
    const { data: carePlans, isLoading } = useCollection<CarePlan>(carePlansQuery);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <DashboardHeader title="Care Plans" />
        {/* We will add a manual creation page later */}
        {/* <Button asChild>
          <Link href="/dashboard/care-plans/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Care Plan
          </Link>
        </Button> */}
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Care Plan ID</TableHead>
              <TableHead>Prescription ID</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Loading care plans...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && carePlans?.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No care plans found.
                </TableCell>
              </TableRow>
            )}
            {carePlans?.map((cp) => (
              <TableRow key={cp.id}>
                <TableCell className="font-medium" onClick={() => router.push(`/dashboard/care-plans/${cp.id}`)}>{cp.id.substring(0, 7)}...</TableCell>
                <TableCell>{cp.prescriptionId.substring(0, 7)}...</TableCell>
                <TableCell>{new Date(cp.createdAt).toLocaleDateString()}</TableCell>
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
                      <DropdownMenuItem onClick={() => router.push(`/dashboard/care-plans/${cp.id}`)}>
                        View Details
                      </DropdownMenuItem>
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
