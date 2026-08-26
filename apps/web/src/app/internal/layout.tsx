"use client"

import * as React from "react"
import { AuthProvider, AuthGuard } from "./auth-context"
import { Header } from "../../components/shell/header"
import { Sidebar } from "../../components/shell/sidebar"

export default function InternalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <AuthGuard>{children}</AuthGuard>
          </main>
        </div>
      </div>
    </AuthProvider>
  )
}
