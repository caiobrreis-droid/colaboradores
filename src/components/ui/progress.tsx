import * as React from 'react'
import { cn } from '@/lib/utils'

const Progress = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { value?: number; max?: number }>(
  ({ className, value = 0, max = 100, ...props }, ref) => (
    <div ref={ref} className={cn('relative h-2 w-full overflow-hidden rounded-full bg-vessel-gray-100', className)} {...props}>
      <div className="h-full bg-vessel-blue rounded-full transition-all duration-300" style={{ width: `${(value / max) * 100}%` }} />
    </div>
  )
)
Progress.displayName = 'Progress'
export { Progress }
