'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

export function ChartRedes({ data }: { data: Array<{ name: string; value: number; color: string }> }) {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle>Situação nas Redes Sociais</CardTitle>
        <CardDescription>
          Mapeamento de engajamento e situação digital.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                content={(props) => {
                  const { payload } = props;
                  return (
                    <ul className="flex justify-center gap-4 text-sm">
                      {payload?.map((entry, index) => (
                        <li key={`item-${index}`} className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                          <span className="text-muted-foreground font-medium">{entry.value}</span>
                        </li>
                      ))}
                    </ul>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none -mt-8">
            <span className="text-4xl font-bold tracking-tight text-foreground">{total}</span>
            <span className="text-sm text-muted-foreground font-medium">Total</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
