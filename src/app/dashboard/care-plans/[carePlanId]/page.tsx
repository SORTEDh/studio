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
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase, updateDocumentNonBlocking, addDocumentNonBlocking } from "@/firebase";
import { collection, doc, query, serverTimestamp } from "firebase/firestore";
import { useParams } from "next/navigation";
import { CarePlan, Task } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ListTodo } from "lucide-react";

export default function CarePlanDetailsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const params = useParams();
  const carePlanId = params.carePlanId as string;
  const [language, setLanguage] = useState<'en' | 'kn'>('en');

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

  const handleTaskToggle = (task: Task) => {
    if (!user || !carePlanId) return;

    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    const taskRef = doc(firestore, `users/${user.uid}/carePlans/${carePlanId}/tasks`, task.id);
    
    updateDocumentNonBlocking(taskRef, { status: newStatus });

    if (newStatus === 'Completed') {
      const taskLogRef = collection(firestore, `users/${user.uid}/carePlans/${carePlanId}/tasks/${task.id}/taskLogs`);
      addDocumentNonBlocking(taskLogRef, {
        taskId: task.id,
        completedAt: serverTimestamp(),
      });
    }
  };

  const completedTasks = tasks?.filter(t => t.status === 'Completed').length || 0;
  const totalTasks = tasks?.length || 0;


  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <DashboardHeader title="Care Plan Details" />
        <div className="flex items-center space-x-2">
            <Button variant={language === 'en' ? 'default' : 'outline'} onClick={() => setLanguage('en')}>EN</Button>
            <Button variant={language === 'kn' ? 'default' : 'outline'} onClick={() => setLanguage('kn')}>KN</Button>
        </div>
      </div>

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
                        <p><strong>ID:</strong> {carePlan.id.substring(0,7)}...</p>
                        <p><strong>Patient ID:</strong> {carePlan.patientId.substring(0,7)}...</p>
                        <p><strong>Prescription ID:</strong> {carePlan.prescriptionId.substring(0,7)}...</p>
                        <p><strong>Created:</strong> {carePlan.createdAt ? new Date(carePlan.createdAt).toLocaleDateString() : 'N/A'}</p>
                    </div>
                ) : (
                    <p>No care plan found.</p>
                )}
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tasks</CardTitle>
                <ListTodo className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{completedTasks} / {totalTasks}</div>
                <p className="text-xs text-muted-foreground">
                    Completed Tasks
                </p>
            </CardContent>
        </Card>

      </div>

       <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Done</TableHead>
              <TableHead>Task</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingTasks && (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Loading tasks...
                </TableCell>
              </TableRow>
            )}
            {!isLoadingTasks && tasks?.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No tasks found for this care plan.
                </TableCell>
              </TableRow>
            )}
            {tasks?.map((task) => (
              <TableRow key={task.id} className={task.status === 'Completed' ? 'bg-muted/50' : ''}>
                <TableCell>
                    <Checkbox checked={task.status === 'Completed'} onCheckedChange={() => handleTaskToggle(task)} />
                </TableCell>
                <TableCell>{language === 'en' ? task.text_en : task.text_kn}</TableCell>
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
