import React from 'react'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | 'default'
    | 'success'
    | 'warning'
    | 'destructive'
    | 'info'
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
      success: 'bg-green-500/20 text-green-300 border border-green-500/30',
      warning: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
      destructive: 'bg-red-500/20 text-red-300 border border-red-500/30',
      info: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
    }

    return (
      <div
        ref={ref}
        className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${variants[variant]} ${className || ''}`}
        {...props}
      />
    )
  }
)

Badge.displayName = 'Badge'
