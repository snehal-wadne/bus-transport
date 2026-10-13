import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#0A0F1C] text-slate-900 dark:text-[#F9FAFB] transition-colors duration-200">
      <Navbar />
      <main className="flex-1 bg-slate-50 dark:bg-[#0A0F1C] transit-grid-bg py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
