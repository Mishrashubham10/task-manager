'use client';

import Link from 'next/link';

export default function PublicNavbar() {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b bg-white w-full">
      <h1 className="text-lg font-bold">TaskManager</h1>

      <div className="flex gap-4">
        <Link href="/login" className="text-sm">
          Login
        </Link>

        <Link
          href="/register"
          className="text-sm bg-black text-white px-3 py-1 rounded-md"
        >
          Sign Up
        </Link>
      </div>
    </header>
  );
}