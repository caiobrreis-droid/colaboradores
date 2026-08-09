import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-vessel-blue focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-vessel-blue text-white shadow hover:bg-vessel-blue/80",
        secondary:
          "border-transparent bg-vessel-gray-100 text-vessel-deep hover:bg-vessel-gray-200",
        destructive:
          "border-transparent bg-red-500 text-white shadow hover:bg-red-500/80",
        outline: "text-vessel-deep border-vessel-gray-200",
        success: "border-transparent bg-vessel-green text-white shadow hover:bg-vessel-green/80",
        warning: "border-transparent bg-amber-500 text-white shadow hover:bg-amber-500/80",
        info: "border-transparent bg-vessel-cyan text-white shadow hover:bg-vessel-cyan/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
