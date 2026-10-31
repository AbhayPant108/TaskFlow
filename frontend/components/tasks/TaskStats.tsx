'use client';

import { useAppSelector } from '@/store';
import { Card, CardContent } from '@/components/ui/card';
import { ListTodo, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export function TaskStats() {
  const { items, totalCount } = useAppSelector((state) => state.tasks);

  const todoCount = items.filter((t) => t.status === 'TODO').length;
  const inProgressCount = items.filter((t) => t.status === 'IN_PROGRESS').length;
  const doneCount = items.filter((t) => t.status === 'DONE').length;
  const urgentCount = items.filter((t) => t.priority === 'URGENT' || t.priority === 'HIGH').length;

  const stats = [
    {
      title: 'Total Tasks',
      value: totalCount,
      icon: ListTodo,
      iconColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/50',
    },
    {
      title: 'To Do',
      value: todoCount,
      icon: Clock,
      iconColor: 'text-gray-600',
      bgColor: 'bg-gray-100 dark:bg-gray-800/50',
    },
    {
      title: 'In Progress',
      value: inProgressCount,
      icon: AlertCircle,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/50',
    },
    {
      title: 'Completed',
      value: doneCount,
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/50',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="overflow-hidden">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
                <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mt-1">
                  {stat.value}
                </p>
              </div>
              <div className={`p-2.5 rounded-xl ${stat.bgColor}`}>
                <Icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
