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
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from "@/firebase";
import { collection, doc, query } from "firebase/firestore";
import { useParams } from "next/navigation";
import { CarePlan, Task } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

export default function CarePlanDetailsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const params = useParams();
  const carePlanId = params.carePlanId as string;

  const carePlanRef = useMemoFirebase(() => {
    if (!user || !carePlanId) return null;
    return doc(firestore, `users/${user.uid}/carePlans`, carePlanId);
  }, [firestore, user, carePlanId]);

  const { data: carePlan, isLoading: isLoadingCarePlan } = useDoc<CarePlan>(carePlanRef);

  const tasksQuery = useMemoFirebase(() => {
    if (!user || !carePlanId) return null;
    return query(collection(firestore, `users/${user.uid}/carePlans/${carePlanId}/tasks`));
  }, [firestore, user, carePlanId]);

  const { data: tasks, isLoading: isLoadingTasks } = useCollection<Task>(tasksQuery);
  
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Completed":
        return "default";
      case "Pending":
        return "secondary";
      case "Missed":
        return "destructive";
      default:
        return "outline";
    }
  };


  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <DashboardHeader title="Care Plan Details" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader>
                <CardTitle>Care Plan Information</CardTitle>
                <CardDescription>Details of the patient's care plan.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoadingCarePlan ? (
                    <p>Loading...</p>
                ) : carePlan ? (
                    <div className="space-y-2">
                        <p><strong>ID:</strong> {carePlan.id}</p>
                        <p><strong>Patient ID:</strong> {carePlan.patientId.substring(0,7)}...</p>
                        <p><strong>Prescription ID:</strong> {carePlan.prescriptionId.substring(0,7)}...</p>
                        <p><strong>Created:</strong> {new Date(carePlan.createdAt).toLocaleDateString()}</p>
                    </div>
                ) : (
                    <p>No care plan found.</p>
                )}
            </CardContent>
        </Card>
      </div>

      <DashboardHeader title="Tasks" />
       <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Status</TableHead>
              <TableHead>Task (English)</TableHead>
              <TableHead>Task (Kannada)</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingTasks && (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Loading tasks...
                </TableCell>
              </TableRow>
            )}
            {!isLoadingTasks && tasks?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No tasks found for this care plan.
                </TableCell>
              </TableRow>
            )}
            {tasks?.map((task) => (
              <TableRow key={task.id}>
                <TableCell>
                    <Checkbox checked={task.status === 'Completed'} />
                </TableCell>
                <TableCell>{task.text_en}</TableCell>
                <TableCell>{task.text_kn}</TableCell>
                <TableCell>{new Date(task.dueDate).toLocaleString()}</TableCell>
                <TableCell>
                  <Badge
                    variant={getStatusVariant(task.status)}
                  >
                    {task.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
