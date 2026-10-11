import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-[#0A0F1C] text-[#F9FAFB]">
      <Navbar />
      <main className="flex-1 bg-[#0A0F1C]">{children}</main>
      <Footer />
    </div>
  );
}
