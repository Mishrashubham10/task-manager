'use client';

import Link from 'next/link';
import {
  useGetMeQuery,
  useLogoutMutation,
} from '@/redux/features/auth/authApi';
import { Button } from '../ui/button';

export default function Navbar() {
  const { data: user, isLoading, isError } = useGetMeQuery();

  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="border-b px-6 py-4 flex justify-between items-center w-full mx-auto">
      {/* Logo */}
      <Link href="/" className="text-xl font-bold">
        Dashboard
      </Link>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* 🔄 Loading state */}
        {isLoading ? (
          <span className="text-sm text-gray-500">Loading...</span>
        ) : user && !isError ? (
          <>
            {/* ✅ Logged in */}
            <span className="text-sm">Hi, {user.name}</span>

            <Button
              variant="outline"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </Button>
          </>
        ) : (
          <>
            {/* ❌ Not logged in */}
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>

            <Link href="/register">
              <Button>Register</Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}