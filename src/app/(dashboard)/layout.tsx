'use client'

import { ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ToastProvider } from '@/contexts/ToastContext'
import { BottomNav, MobileMenu } from '@/components/Navigation'
import { useRouter, usePathname } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const isAuthPage = pathname === '/login' || pathname === '/register'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user && !isAuthPage) {
    router.push('/login')
    return null
  }

  if (user && isAuthPage) {
    router.push('/dashboard')
    return null
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-background">
        {!isAuthPage && (
          <>
            <MobileMenu />
            <BottomNav />
          </>
        )}
        <main className={!isAuthPage ? 'md:ml-64 pb-20 md:pb-0 pt-14 md:pt-0' : ''}>
          {children}
        </main>
      </div>
    </ToastProvider>
  )
}
