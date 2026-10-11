import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-[#0A0F1C] text-[#F9FAFB]">
      <Navbar />
      <main className="flex-1 bg-[#0A0F1C] transit-grid-bg py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
