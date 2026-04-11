import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        'flex h-9 w-full rounded-md border border-border bg-white px-3 py-1 text-sm text-foreground placeholder:text-[#8c8c8c] focus:outline-none focus:ring-2 focus:ring-[#191919] focus:ring-offset-1 disabled:opacity-50 transition-shadow',
        className
      )}
      ref={ref}
      {...props}
    />
  )
)
Input.displayName = 'Input'

export { Input }
