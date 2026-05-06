import PublicNavbar from '@/components/public/Navbar';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <PublicNavbar />

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center py-24 px-6">
        <h1 className="text-4xl font-bold max-w-2xl">
          Manage your tasks smarter, faster, and better
        </h1>

        <p className="text-gray-600 mt-4 max-w-xl">
          A powerful task management system with collaboration, notifications,
          and real-time updates.
        </p>

        <div className="mt-6 flex gap-4">
          <a
            href="/register"
            className="bg-black text-white px-5 py-2 rounded-md"
          >
            Get Started
          </a>

          <a href="/login" className="border px-5 py-2 rounded-md">
            Login
          </a>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 py-16 max-w-5xl mx-auto">
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="font-semibold">Task Management</h3>
          <p className="text-sm text-gray-600 mt-2">
            Create, update, and track tasks easily.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="font-semibold">Collaboration</h3>
          <p className="text-sm text-gray-600 mt-2">
            Work with your team in real-time.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="font-semibold">Notifications</h3>
          <p className="text-sm text-gray-600 mt-2">
            Stay updated with smart alerts.
          </p>
        </div>
      </section>

      <footer className="text-center text-sm text-gray-500 py-6">
        © 2026 TaskManager. All rights reserved.
      </footer>
    </div>
  );
}