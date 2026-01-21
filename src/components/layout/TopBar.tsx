'use client';

import { Bell, User } from 'lucide-react';
import { useUser } from '@/store/authStore';

export function TopBar() {
  const user = useUser();

  return (
    <header className="fixed left-64 right-0 top-0 z-30 h-16 border-b border-gray-200 bg-white/80 backdrop-blur-xl">
      <div className="flex h-full items-center justify-between px-6">
        {/* Page Title - Can be overridden by pages */}
        <div>
          <h1 className="text-xl font-display font-semibold text-gray-900">
            Dashboard
          </h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Balance */}
          {user && (
            <div className="px-4 py-2 bg-gradient-primary rounded-lg text-white font-semibold text-sm shadow-md">
              R$ {user.balance?.toFixed(2) || '0,00'}
            </div>
          )}

          {/* Notifications */}
          <button className="relative rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700">
            <Bell className="h-5 w-5" />
            {/* Notification badge */}
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
          </button>

          {/* User Menu */}
          <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-primary text-white">
              <User className="h-4 w-4" />
            </div>
            <div className="text-sm">
              <p className="font-medium text-gray-900">{user?.name || 'Usuário'}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
