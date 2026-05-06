import Navbar from "@/components/layouts/Navbar";
import Sidebar from "@/components/layouts/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <Navbar />

        {/* Content */}
        <main className="p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}