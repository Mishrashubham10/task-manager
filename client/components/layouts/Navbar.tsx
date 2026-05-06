'use client';

import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();

  const handleLogout = () => {
    // later connect API
    router.push('/login');
  };

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6">
      {/* Left */}
      <h2 className="text-lg font-semibold">Dashboard</h2>

      {/* Right */}
      <div className="flex items-center gap-4">
        <button className="text-sm text-gray-600 hover:text-black">🔔</button>

        <button
          onClick={handleLogout}
          className="text-sm bg-black text-white px-3 py-1 rounded-md"
        >
          Logout
        </button>
      </div>
    </header>
  );
}