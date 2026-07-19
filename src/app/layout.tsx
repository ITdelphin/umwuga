import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Umwuga AI - Your AI Career Assistant",
  description: "Build professional documents, prepare for interviews, and manage your career journey with AI.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}
