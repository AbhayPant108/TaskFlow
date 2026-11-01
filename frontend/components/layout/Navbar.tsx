'use client';

import { useAuth } from '@/hooks/useAuth';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { Project } from '@/types/project';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  FolderKanban,
  LayoutDashboard,
  CheckSquare,
  Users,
  Plus,
  LogIn,
  LogOut,
  User as UserIcon,
  ChevronDown,
  ShieldCheck,
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'dashboard' | 'projects' | 'tasks' | 'team';
  onTabChange: (tab: 'dashboard' | 'projects' | 'tasks' | 'team') => void;
  onSelectProject: (project: Project | null) => void;
}

export function Navbar({ currentTab, onTabChange, onSelectProject }: NavbarProps) {
  const { user, isAuthenticated, logout, openAuth, openProfile, login } = useAuth();
  const { projects, activeProject } = useProjects();
  const { openCreate: openTaskCreate } = useTasks();

  const handleQuickDemoSwitch = async (email: string) => {
    try {
      await login({ email, password: 'AdminPass123!' });
    } catch {
      //
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200/80 bg-white/80 backdrop-blur-md dark:border-gray-800/80 dark:bg-gray-950/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Navigation */}
        <div className="flex items-center gap-6">
          <div
            onClick={() => onTabChange('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black text-sm shadow-sm group-hover:scale-105 transition-transform">
              TF
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                TaskFlow
                <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 dark:text-indigo-400 px-1.5 py-0.2 rounded">
                  v0.3
                </span>
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                onSelectProject(null);
                onTabChange('dashboard');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                currentTab === 'dashboard'
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </button>

            <button
              type="button"
              onClick={() => onTabChange('projects')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                currentTab === 'projects'
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
              }`}
            >
              <FolderKanban className="h-4 w-4" /> Projects
            </button>

            <button
              type="button"
              onClick={() => onTabChange('tasks')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                currentTab === 'tasks'
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
              }`}
            >
              <CheckSquare className="h-4 w-4" /> Tasks
            </button>

            <button
              type="button"
              onClick={() => onTabChange('team')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                currentTab === 'team'
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
              }`}
            >
              <Users className="h-4 w-4" /> Team
            </button>
          </nav>
        </div>

        {/* Right Section: Project Quick Switcher & User Profile */}
        <div className="flex items-center gap-3">
          {/* Quick Project Switcher Dropdown */}
          <div className="hidden sm:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs font-medium flex items-center gap-2 max-w-[170px]"
                >
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: activeProject?.color || '#6366F1' }}
                  />
                  <span className="truncate">
                    {activeProject ? activeProject.name : 'All Projects'}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 opacity-50 ml-auto shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Scope Workspace</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => onSelectProject(null)}
                  className="font-medium"
                >
                  <FolderKanban className="h-3.5 w-3.5 mr-2 text-indigo-600" /> All Projects
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {projects.map((p) => (
                  <DropdownMenuItem
                    key={p.id}
                    onClick={() => onSelectProject(p)}
                    className="flex items-center gap-2"
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: p.color || '#3B82F6' }}
                    />
                    <span className="truncate">{p.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Quick Add Task */}
          <Button
            size="sm"
            onClick={openTaskCreate}
            className="h-8 text-xs flex items-center gap-1 font-semibold"
          >
            <Plus className="h-3.5 w-3.5" /> Task
          </Button>

          {/* User Auth Pill & Dropdown */}
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full p-1 pl-2 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-colors"
                >
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-bold leading-none text-gray-900 dark:text-gray-100">
                      {user.full_name || user.email}
                    </p>
                    <p className="text-[10px] text-gray-500 leading-tight">
                      {user.role}
                    </p>
                  </div>
                  <Avatar
                    src={user.avatar}
                    fallback={user.full_name || user.email}
                    size="sm"
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-xs font-bold text-gray-900 dark:text-gray-100">
                      {user.full_name || user.email}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                    <Badge variant="secondary" className="w-fit text-[10px] mt-1">
                      {user.role}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={openProfile}>
                  <UserIcon className="h-4 w-4 mr-2" /> Profile & Security
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                {/* Switch Demo User shortcut */}
                <DropdownMenuLabel className="text-[11px] text-gray-400">
                  Switch Demo User
                </DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleQuickDemoSwitch('admin@taskflow.dev')}>
                  <ShieldCheck className="h-3.5 w-3.5 mr-2 text-indigo-600" /> Alex (Admin)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleQuickDemoSwitch('sarah.chen@taskflow.dev')}>
                  <ShieldCheck className="h-3.5 w-3.5 mr-2 text-purple-600" /> Sarah (Manager)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleQuickDemoSwitch('david.kim@taskflow.dev')}>
                  <ShieldCheck className="h-3.5 w-3.5 mr-2 text-emerald-600" /> David (Member)
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem destructive onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openAuth('login')}
                className="h-8 text-xs font-semibold flex items-center gap-1.5"
              >
                <LogIn className="h-3.5 w-3.5" /> Sign In
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
