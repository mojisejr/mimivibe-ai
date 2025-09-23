import { ClerkProvider } from "@clerk/nextjs";
import { Inter, Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/ToastContainer";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  display: "swap",
  variable: "--font-noto-sans-thai",
});

export const metadata = {
  title: "MiMiVIBE - AI ไพ่ทาโรต์",
  description:
    "เปิดเผยเส้นทางของคุณด้วยการทำนายไพ่ทาโรต์ด้วย AI และข้อมูลเชิงลึกลึกลับ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="th" data-theme="mimivibes" className={`${inter.variable} ${notoSansThai.variable}`}>
        <body className={notoSansThai.className}>
          <ToastProvider>
            <div className="page-container safe-area-full">{children}</div>
          </ToastProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
