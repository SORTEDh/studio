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
import { ListTodo, CheckCircle2, XCircle, Hourglass } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

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
  
  const getStatusProps = (status: string) => {
    switch (status) {
      case "Completed":
        return { variant: "default", icon: <CheckCircle2 className="h-4 w-4" />, className: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' };
      case "Pending":
        return { variant: "secondary", icon: <Hourglass className="h-4 w-4" />, className: '' };
      case "Missed":
        return { variant: "destructive", icon: <XCircle className="h-4 w-4" />, className: '' };
      default:
        return { variant: "outline", icon: <Hourglass className="h-4 w-4" />, className: '' };
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
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;


  return (
    <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between gap-4">
        <DashboardHeader title="Care Plan Details" />
        <div className="flex items-center space-x-2 flex-shrink-0">
            <Button size="sm" variant={language === 'en' ? 'default' : 'outline'} onClick={() => setLanguage('en')}>EN</Button>
            <Button size="sm" variant={language === 'kn' ? 'default' : 'outline'} onClick={() => setLanguage('kn')}>KN</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader>
                <CardTitle>Care Plan</CardTitle>
                <CardDescription>Patient's care plan details.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoadingCarePlan ? (
                    <p>Loading...</p>
                ) : carePlan ? (
                    <div className="space-y-2 text-sm">
                        <p><strong>ID:</strong> {carePlan.id.substring(0,7)}...</p>
                        <p><strong>Patient ID:</strong> {carePlan.patientId.substring(0,7)}...</p>
                        <p><strong>Prescription ID:</strong> {carePlan.prescriptionId.substring(0,7)}...</p>
                        <p><strong>Created:</strong> {carePlan.createdAt ? new Date(carePlan.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</p>
                    </div>
                ) : (
                    <p>No care plan found.</p>
                )}
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Task Progress</CardTitle>
                <ListTodo className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{completedTasks} / {totalTasks}</div>
                <p className="text-xs text-muted-foreground">
                    completed tasks
                </p>
            </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
            <CardTitle>Tasks Checklist</CardTitle>
            <CardDescription>A list of tasks for this care plan.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="border rounded-lg overflow-hidden">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead className="w-[80px]">Status</TableHead>
                    <TableHead>Task Description</TableHead>
                    <TableHead className="w-[200px]">Due Date</TableHead>
                    <TableHead className="w-[120px]">State</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoadingTasks && (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                        Loading tasks...
                        </TableCell>
                    </TableRow>
                    )}
                    {!isLoadingTasks && tasks?.length === 0 && (
                     <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                            <Alert>
                                <AlertTitle>No Tasks Found</AlertTitle>
                                <AlertDescription>
                                    No tasks have been generated for this care plan yet.
                                </AlertDescription>
                            </Alert>
                        </TableCell>
                    </TableRow>
                    )}
                    {tasks?.map((task) => {
                        const statusProps = getStatusProps(task.status);
                        return (
                            <TableRow key={task.id} data-state={task.status === 'Completed' ? 'completed' : ''} className="data-[state=completed]:bg-muted/50">
                                <TableCell className="text-center">
                                    <Checkbox aria-label={`Mark task as ${task.status === 'Completed' ? 'pending' : 'completed'}`} checked={task.status === 'Completed'} onCheckedChange={() => handleTaskToggle(task)} className="h-6 w-6"/>
                                </TableCell>
                                <TableCell className="font-medium">{language === 'en' ? task.text_en : task.text_kn}</TableCell>
                                <TableCell className="text-muted-foreground">{new Date(task.dueDate).toLocaleString()}</TableCell>
                                <TableCell>
                                <Badge
                                    variant={statusProps.variant}
                                    className={cn('gap-1.5', statusProps.className)}
                                >
                                    {statusProps.icon}
                                    {task.status}
                                </Badge>
                                </TableCell>
                            </TableRow>
                        )}
                    )}
                </TableBody>
                </Table>
            </div>
        </CardContent>
       </Card>
    </main>
  );
}
