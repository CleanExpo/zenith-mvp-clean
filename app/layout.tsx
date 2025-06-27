import './globals.css'
import { NextAuthProvider } from '@/lib/session-provider'
import { AuthProvider } from '@/lib/auth-context'
import { AdminAuthProvider } from '@/lib/admin-auth'

export const metadata = {
  title: 'Zenith MVP',
  description: 'Minimal Viable Product for Zenith Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <NextAuthProvider>
          <AuthProvider>
            <AdminAuthProvider>
              {children}
            </AdminAuthProvider>
          </AuthProvider>
        </NextAuthProvider>
      </body>
    </html>
  )
}