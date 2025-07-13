import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
})

export const metadata = {
  title: 'MiMiVibes - AI Tarot Reading',
  description: 'Discover your path with AI-powered tarot readings and mystical insights',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" data-theme="mimivibes">
        <body className={inter.className}>
          <div className="page-container safe-area-full">
            {children}
          </div>
        </body>
      </html>
    </ClerkProvider>
  )
}