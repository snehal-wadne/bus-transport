import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#0A0F1C] text-slate-900 dark:text-[#F9FAFB] transition-colors duration-200">
      <Navbar />
      <main className="flex-1 bg-slate-50 dark:bg-[#0A0F1C]">{children}</main>
      <Footer />
    </div>
  );
}
