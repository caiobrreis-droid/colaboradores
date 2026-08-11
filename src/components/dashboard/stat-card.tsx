'use client'

import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: number
  subtitle?: string
  icon: LucideIcon
  trend?: number
  color: 'blue' | 'green' | 'red' | 'yellow' | 'cyan' | 'purple'
}

const colorStyles = {
  blue: {
    bg: "bg-vessel-blue/10",
    text: "text-vessel-blue",
    border: "from-vessel-blue/40 to-transparent",
  },
  green: {
    bg: "bg-vessel-green/10",
    text: "text-vessel-green",
    border: "from-vessel-green/40 to-transparent",
  },
  red: {
    bg: "bg-red-500/10",
    text: "text-red-500",
    border: "from-red-500/40 to-transparent",
  },
  yellow: {
    bg: "bg-amber-500/10",
    text: "text-amber-500",
    border: "from-amber-500/40 to-transparent",
  },
  cyan: {
    bg: "bg-vessel-cyan/10",
    text: "text-vessel-cyan",
    border: "from-vessel-cyan/40 to-transparent",
  },
  purple: {
    bg: "bg-violet-500/10",
    text: "text-violet-600",
    border: "from-violet-500/40 to-transparent",
  },
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, color }: StatCardProps) {
  const styles = colorStyles[color]

  return (
    <Card className="relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg">
      <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", styles.border)} />
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-4">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className={cn("rounded-xl p-2", styles.bg)}>
            <Icon className={cn("h-4 w-4", styles.text)} />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl font-bold tracking-tight">{value}</h2>
            {trend !== undefined && (
              <div className={cn(
                "flex items-center text-xs font-medium",
                trend > 0 ? "text-vessel-green" : trend < 0 ? "text-red-500" : "text-muted-foreground"
              )}>
                {trend > 0 ? <TrendingUp className="mr-1 h-3 w-3" /> : trend < 0 ? <TrendingDown className="mr-1 h-3 w-3" /> : null}
                {trend > 0 ? '+' : ''}{trend}%
              </div>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
