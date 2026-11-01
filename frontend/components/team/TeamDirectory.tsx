'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchUsers, setUserSearch, setUserRoleFilter } from '@/store/userSlice';
import { useTasks } from '@/hooks/useTasks';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Search, Users, Mail } from 'lucide-react';

export function TeamDirectory() {
  const dispatch = useAppDispatch();
  const { items: users, status, search, roleFilter } = useAppSelector((state) => state.users);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { tasks } = useTasks();

  useEffect(() => {
    if (!isAuthenticated) return;
    dispatch(fetchUsers());
  }, [dispatch, isAuthenticated, search, roleFilter]);

  const roles = [
    { key: 'ALL', label: 'All Roles' },
    { key: 'ADMIN', label: 'Admins' },
    { key: 'MANAGER', label: 'Managers' },
    { key: 'MEMBER', label: 'Members' },
  ];

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => dispatch(setUserSearch(e.target.value))}
            placeholder="Search teammates by name or email..."
            className="pl-9 h-9 text-xs"
          />
        </div>

        {/* Role Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          {roles.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => dispatch(setUserRoleFilter(r.key))}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                roleFilter === r.key
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Team Members */}
      {status === 'loading' && users.length === 0 ? (
        <div className="p-12 text-center text-xs text-gray-500">Loading team members...</div>
      ) : users.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center dark:border-gray-800 space-y-2">
          <Users className="mx-auto h-8 w-8 text-gray-400" />
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            No team members found
          </p>
          <p className="text-xs text-gray-500">Try adjusting your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {users.map((member) => {
            const memberTasks = tasks.filter((t) => t.assigned_to?.id === member.id);
            const inProgressCount = memberTasks.filter((t) => t.status === 'IN_PROGRESS').length;
            const doneCount = memberTasks.filter((t) => t.status === 'DONE').length;

            return (
              <Card
                key={member.id}
                className="overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow dark:border-gray-800"
              >
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={member.avatar}
                        fallback={member.full_name || member.email}
                        size="lg"
                      />
                      <div>
                        <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">
                          {member.full_name || member.email}
                        </h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Mail className="h-3 w-3" /> {member.email}
                        </p>
                      </div>
                    </div>

                    <Badge
                      variant={
                        member.role === 'ADMIN'
                          ? 'destructive'
                          : member.role === 'MANAGER'
                          ? 'default'
                          : 'secondary'
                      }
                      className="text-[10px]"
                    >
                      {member.role}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-5 pt-2 space-y-3">
                  {/* Task Workload Metrics */}
                  <div className="grid grid-cols-3 gap-2 rounded-lg bg-gray-50 dark:bg-gray-800/40 p-2.5 text-center text-xs">
                    <div>
                      <p className="text-[10px] text-gray-400">Total Tasks</p>
                      <p className="font-bold text-gray-900 dark:text-gray-100">
                        {memberTasks.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-amber-600 dark:text-amber-400">Active</p>
                      <p className="font-bold text-amber-700 dark:text-amber-300">
                        {inProgressCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400">Done</p>
                      <p className="font-bold text-emerald-700 dark:text-emerald-300">
                        {doneCount}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
