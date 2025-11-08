
"use client"

import { useMemo } from "react"
import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, Tooltip } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collectionGroup, query, where, Timestamp } from "firebase/firestore";
import { eachDayOfInterval, subDays, format } from 'date-fns';
import { Skeleton } from "./ui/skeleton"
import type { TaskLog } from "@/lib/types"

const chartConfig = {
  tasks: {
    label: "Tasks",
    color: "hsl(var(--chart-1))",
  },
}

export function TaskCompletionChart() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const sevenDaysAgo = useMemo(() => subDays(new Date(), 7), []);

    const taskLogsQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(
            collectionGroup(firestore, 'taskLogs'),
            where('patientId', '==', user.uid),
            where('completedAt', '>=', Timestamp.fromDate(sevenDaysAgo))
        );
    }, [firestore, user, sevenDaysAgo]);

    const { data: taskLogs, isLoading: isLoadingLogs } = useCollection<TaskLog>(taskLogsQuery);
    
    const data = useMemo(() => {
        const days = eachDayOfInterval({
          start: sevenDaysAgo,
          end: new Date(),
        });

        const chartData = days.map(day => ({
            date: format(day, 'MMM d'),
            tasks: 0,
        }));

        if (taskLogs) {
            taskLogs.forEach(log => {
                if(log.completedAt?.toDate) {
                    const dateStr = format(log.completedAt.toDate(), 'MMM d');
                    const dayData = chartData.find(d => d.date === dateStr);
                    if (dayData) {
                        dayData.tasks++;
                    }
                }
            });
        }
        return chartData;
    }, [taskLogs, sevenDaysAgo]);

  const isLoading = isUserLoading || isLoadingLogs;

  if (isLoading) {
    return <Skeleton className="h-[250px] w-full" />
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value}
        />
        <Tooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dot" />}
        />
        <Bar dataKey="tasks" fill="var(--color-tasks)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
