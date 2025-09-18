import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/ToastContainer";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "MiMiVIBE - AI Tarot Reading",
  description:
    "Discover your path with AI-powered tarot readings and mystical insights",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" data-theme="mimivibes">
        <body className={inter.className}>
          <ToastProvider>
            <div className="page-container safe-area-full">{children}</div>
          </ToastProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
