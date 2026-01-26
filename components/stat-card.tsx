import type { LucideIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  label?: string 
  trend?: number
  trends?: number
  color?: "primary" | "success" | "warning" | "danger"
}

export function StatCard({ title, value, icon: Icon, label, trend, trends, color = "primary" }: StatCardProps) {
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    success: "bg-green-500/10 text-green-600",
    warning: "bg-yellow-500/10 text-yellow-600",
    danger: "bg-red-500/10 text-red-600",
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-sm text-muted-foreground">{label}</p>
        {trend && (
          <p className={`text-xs ${trend > 0 ? "text-green-600" : "text-red-600"}`}>
            {trend > 0 ? "+" : ""}
            {trend}% vs mês anterior
          </p>
        )}
        {trends && (
          <p className={`text-xs ${trends > 0 ? "text-green-600" : "text-red-600"}`}>
            {trends > 0 ? "+" : ""}
            {trends}% vs semana anterior
          </p>
        )}
      </CardContent>
    </Card>
  )
}
