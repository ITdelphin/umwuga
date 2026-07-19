"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { DashboardHeader } from "@/components/layout/dashboard-header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <DashboardHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
