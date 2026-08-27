import React from 'react'

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, ...props }, ref) => {
    const percentage = (value / max) * 100

    return (
      <div
        ref={ref}
        className={`h-2 w-full rounded-full bg-dark-700 overflow-hidden ${className || ''}`}
        {...props}
      >
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        />
      </div>
    )
  }
)

Progress.displayName = 'Progress'
