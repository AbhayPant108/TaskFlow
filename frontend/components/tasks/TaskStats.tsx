'use client';

import { useTasks } from '@/hooks/useTasks';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Clock, AlertTriangle, Layers } from 'lucide-react';

export function TaskStats() {
  const { stats, status } = useTasks();

  const cards = [
    {
      title: 'Total Tasks',
      value: stats.total,
      icon: Layers,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/40',
      subtext: 'Across accessible projects',
    },
    {
      title: 'In Progress',
      value: stats.inProgress,
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/40',
      subtext: 'Actively being developed',
    },
    {
      title: 'Completed',
      value: stats.done,
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
      subtext: 'Marked as Done',
    },
    {
      title: 'Urgent & Overdue',
      value: stats.urgent,
      icon: AlertTriangle,
      color: 'text-rose-600 dark:text-rose-400',
      bgColor: 'bg-rose-50 dark:bg-rose-950/40',
      subtext: stats.overdue > 0 ? `${stats.overdue} overdue deadlines` : 'Needs attention',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Card key={idx} className="relative overflow-hidden border border-gray-200 shadow-sm dark:border-gray-800">
            <CardContent className="p-4 sm:p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {card.title}
                </p>
                <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                  {status === 'loading' && stats.total === 0 ? '—' : card.value}
                </p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500">
                  {card.subtext}
                </p>
              </div>
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.bgColor} ${card.color} shrink-0`}>
                <Icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
