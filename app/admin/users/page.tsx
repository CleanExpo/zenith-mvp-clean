import { UserManagement } from '@/components/admin/user-management'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export const dynamic = 'force-dynamic'

export default function AdminUsersPage() {
  return (
    <ProtectedRoute adminOnly>
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">
              User Management
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Manage users, monitor activity, and track subscription analytics
            </p>
          </div>

          <UserManagement />
        </div>
      </main>
    </ProtectedRoute>
  )
}