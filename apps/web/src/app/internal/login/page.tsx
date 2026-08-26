"use client"

import * as React from "react"
import { useAuth } from "../auth-context"

export default function LoginPage() {
  const { login } = useAuth()
  
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="w-full max-w-sm rounded-lg border bg-card p-8 shadow-sm">
        <h2 className="text-2xl font-semibold mb-6">Login</h2>
        <button
          onClick={() => login()}
          className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
        >
          Login
        </button>
      </div>
    </div>
  )
}
