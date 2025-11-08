
'use client';

import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy, limit } from "firebase/firestore";
import { Task, CarePlan, TaskLog } from "@/lib/types";
import { CheckCircle2, ListChecks, Activity } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TaskCompletionChart } from "@/components/task-completion-chart";

export default function AnalyticsPage() {
    const { user } = useUser();
    const firestore = useFirestore();

    const tasksQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, `users/${user.uid}/carePlans`));
    }, [firestore, user]);
    
    // This is inefficient as it fetches all care plans and then all tasks.
    // For a real app, you'd probably use aggregated data.
    const { data: carePlans } = useCollection<CarePlan>(tasksQuery);

    const allTasksQuery = useMemoFirebase(() => {
        if (!user || !carePlans) return null;
        // This is a simplification. Firestore doesn't support collection group queries with complex constraints on the client side easily.
        // We'll query all tasks for the first care plan for this demo.
        if (carePlans.length === 0) return null;
        const allTasks: any[] = [];
        // A real implementation would need a more scalable way to get all tasks
        return query(collection(firestore, `users/${user.uid}/carePlans/${carePlans[0].id}/tasks`));
    }, [firestore, user, carePlans]);

    const { data: tasks, isLoading: isLoadingTasks } = useCollection<Task>(allTasksQuery);

    const allTaskLogsQuery = useMemoFirebase(() => {
        if (!user || !carePlans || carePlans.length === 0) return null;
        // Again, a simplification for demo purposes
        return query(collection(firestore, `users/${user.uid}/carePlans/${carePlans[0].id}/tasks/${tasks?.[0].id}/taskLogs`), orderBy("completedAt", "desc"), limit(5));
    }, [firestore, user, carePlans, tasks]);

    const { data: taskLogs, isLoading: isLoadingTaskLogs } = useCollection<TaskLog>(allTaskLogsQuery);

    const totalTasks = tasks?.length || 0;
    const completedTasks = tasks?.filter(t => t.status === 'Completed').length || 0;
    const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return (
        <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <DashboardHeader title="Analytics" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Task Completion</CardTitle>
                        <ListChecks className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{completedTasks} / {totalTasks}</div>
                        <p className="text-xs text-muted-foreground">tasks completed</p>
                        <Progress value={completionPercentage} className="mt-2 h-2" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Adherence Score</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{completionPercentage.toFixed(0)}%</div>
                        <p className="text-xs text-muted-foreground">Based on completed tasks</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Care Plans</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{carePlans?.length || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Total active plans
                        </p>
                    </CardContent>
                </Card>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                 <Card>
                    <CardHeader>
                        <CardTitle>7-Day Task Completion</CardTitle>
                        <CardDescription>Tasks completed over the last week.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TaskCompletionChart />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Latest task completions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Task ID</TableHead>
                                    <TableHead>Completed At</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoadingTaskLogs && <TableRow><TableCell colSpan={2} className="text-center">Loading...</TableCell></TableRow>}
                                {!isLoadingTaskLogs && taskLogs?.length === 0 && <TableRow><TableCell colSpan={2} className="text-center">No recent activity.</TableCell></TableRow>}
                                {taskLogs?.map(log => (
                                    <TableRow key={log.id}>
                                        <TableCell className="font-medium">{log.taskId.substring(0, 7)}...</TableCell>
                                        <TableCell>{log.completedAt ? new Date(log.completedAt.seconds * 1000).toLocaleString() : 'N/A'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                         </Table>
                    </CardContent>
                </Card>

            </div>
        </main>
    );
}
