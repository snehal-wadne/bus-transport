import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#0A0F1C] text-slate-900 dark:text-[#F9FAFB] transition-colors duration-200">
      <Navbar />
      <div className="flex-1 flex flex-col md:flex-row bg-slate-50 dark:bg-[#0A0F1C]">
        <AdminSidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full transit-grid-bg">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
