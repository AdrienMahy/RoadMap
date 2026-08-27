import React from 'react'

export interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  )
}

export const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={`bg-dark-900 border border-dark-700 rounded-lg shadow-lg max-w-md w-full mx-4 ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  )
)

DialogContent.displayName = 'DialogContent'

export const DialogHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={`border-b border-dark-700 px-6 py-4 ${className || ''}`} {...props} />
  )
)

DialogHeader.displayName = 'DialogHeader'

export const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2 ref={ref} className={`text-xl font-bold text-dark-50 ${className || ''}`} {...props} />
  )
)

DialogTitle.displayName = 'DialogTitle'

export const DialogFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={`border-t border-dark-700 px-6 py-4 flex gap-3 justify-end ${className || ''}`} {...props} />
  )
)

DialogFooter.displayName = 'DialogFooter'
