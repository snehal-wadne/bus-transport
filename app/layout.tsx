import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flora Institutes • Campus Transport Portal",
  description:
    "Official transportation portal for Flora Education Society & Institutes: bus pass application, live status tracking, route management, and verified digital transit ID cards.",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col font-sans antialiased bg-[#0A0F1C] text-[#F9FAFB] selection:bg-indigo-500 selection:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
