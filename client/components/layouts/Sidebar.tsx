'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen border-r p-4 flex flex-col">
      {/* App Name */}
      <h2 className="text-xl font-bold mb-6">TaskFlow</h2>

      {/* Quick Filters */}
      <div className="space-y-2 text-sm">
        <Link href="/today" className="block p-2 rounded hover:bg-muted">
          📅 Today
        </Link>
        <Link href="/upcoming" className="block p-2 rounded hover:bg-muted">
          ⏳ Upcoming
        </Link>
        <Link href="/completed" className="block p-2 rounded hover:bg-muted">
          ✅ Completed
        </Link>
      </div>

      {/* Projects */}
      <div className="mt-6">
        <p className="text-xs text-muted-foreground mb-2">Projects</p>
        <div className="space-y-1">
          <div className="p-2 rounded hover:bg-muted cursor-pointer">
            📁 Personal
          </div>
          <div className="p-2 rounded hover:bg-muted cursor-pointer">
            📁 Work
          </div>
        </div>
      </div>

      {/* Add Task */}
      <div className="mt-auto">
        <Button className="w-full">+ New Task</Button>
      </div>
    </aside>
  );
}