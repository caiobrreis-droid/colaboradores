'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type UpdateType = 'success' | 'warning' | 'info' | 'destructive' | 'default'

interface Update {
  id: string
  user: string
  initials: string
  action: string
  target: string
  time: string
  type: UpdateType
}

const updates: Update[] = []

export function RecentUpdates() {
  return (
    <Card className="col-span-1 md:col-span-5">
      <CardHeader>
        <CardTitle>Últimas Atualizações</CardTitle>
        <CardDescription>
          Registro de atividades recentes no sistema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            {updates.length === 0 && (
              <div className="flex h-[320px] items-center justify-center text-center text-sm text-muted-foreground">
                As próximas alterações realizadas no sistema aparecerão aqui.
              </div>
            )}
            {updates.map((update) => (
              <div key={update.id} className="relative flex gap-4 pb-2">
                <div className={cn(
                  "absolute left-5 top-10 -bottom-6 w-px bg-border",
                  update.id === updates[updates.length - 1].id ? "hidden" : ""
                )} />

                <Avatar className="h-10 w-10 border-2 border-background ring-2 ring-muted shadow-sm z-10">
                  <AvatarFallback className={cn(
                    "text-xs font-bold",
                    update.type === 'success' ? "bg-vessel-green/10 text-vessel-green" :
                    update.type === 'destructive' ? "bg-red-500/10 text-red-500" :
                    update.type === 'warning' ? "bg-amber-500/10 text-amber-500" :
                    "bg-vessel-blue/10 text-vessel-blue"
                  )}>
                    {update.initials}
                  </AvatarFallback>
                </Avatar>

                <div className="flex flex-1 flex-col space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      {update.user}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {update.time}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span>{update.action}</span>
                    <Badge variant={
                      update.type === 'success' ? 'success' :
                      update.type === 'warning' ? 'warning' :
                      update.type === 'destructive' ? 'destructive' :
                      update.type === 'info' ? 'info' : 'secondary'
                    } className="font-medium">
                      {update.target}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
