import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { AuthSessionProvider } from "@/components/session-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { AppShell } from "@/components/app-shell"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Bangle Tracking App",
  description: "Track bangle products through manufacturing steps",
  manifest: "/manifest.json",
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2563eb" },
    { media: "(prefers-color-scheme: dark)", color: "#1e3a8a" },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem("theme");var s=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";var r=t==="dark"||t==="light"?t:s;if(r==="dark")document.documentElement.classList.add("dark");})();`,
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider>
          <AuthSessionProvider>
            <AppShell>
              {children}
            </AppShell>
            <Toaster />
          </AuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
