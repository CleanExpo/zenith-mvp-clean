import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  icon?: ReactNode
  children?: ReactNode
  className?: string
}

export function PageHeader({ title, description, icon, children, className }: PageHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between pb-6 border-b', className)}>
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          {icon}
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        </div>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex items-center space-x-2">
          {children}
        </div>
      )}
    </div>
  )
}