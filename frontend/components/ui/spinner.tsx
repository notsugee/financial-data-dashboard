import { cn } from "@/lib/utils"

interface SpinnerProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'primary' | 'secondary'
}

export function Spinner({
  className,
  size = 'md',
  variant = 'default',
  ...props
}: SpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-t-2 border-b-2",
        {
          'border-muted': variant === 'default',
          'border-primary': variant === 'primary',
          'border-secondary': variant === 'secondary',
          'h-4 w-4 border-t-1 border-b-1': size === 'sm',
          'h-6 w-6 border-t-2 border-b-2': size === 'md',
          'h-8 w-8 border-t-2 border-b-2': size === 'lg',
        },
        className
      )}
      {...props}
    />
  )
}