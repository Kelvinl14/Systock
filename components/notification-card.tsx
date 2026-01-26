"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useProducts } from "@/lib/hooks/use-products"
import { useStores } from "@/lib/hooks/use-stores"

interface Movement {
  id: number
  store_id: number
  movement_type: string
  stock_before: number
  stock_after: number
  movement_date: string
  notes?: string
  product_id?: number
  store_name?: string
  product_name?: string
}

interface NotificationCardProps {
  movements: Movement[]
  onClose?: () => void
}

export function NotificationCard({ movements, onClose }: NotificationCardProps) {
  const latestMovements = movements.slice(0, 5)

  const [storeId, setStoreId] = useState("all")
  const [productId, setProductId] = useState("all")
  const { data: products = [] } = useProducts()
  const { data: stores = [] } = useStores()

  const getProductName = (id: number) => {
    const product = products.find((p: any) => p.id === id)
    return product?.name || `Produto ${id}`
  }

  const getStoreName = (id: number) => {
    const store = stores.find((s: any) => s.id === id)
    return store?.name || `Loja ${id}`
  }

  const getMovementTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'IN': 'Entrada',
      'OUT': 'Saída',
      'TRANSFER': 'Transferência',
      'ADJUSTMENT': 'Ajuste',
    }
    return types[type] || type
  }

  const getMovementTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'IN': 'text-green-600',
      'OUT': 'text-red-600',
      'TRANSFER': 'text-blue-600',
      'ADJUSTMENT': 'text-yellow-600',
    }
    return colors[type] || 'text-gray-600'
  }

  const getStockDifference = (before: number, after: number) => {
    const diff = after - before
    return diff > 0 ? `+${diff}` : `${diff}`
  }

  return (
    <Card className="absolute right-0 top-full mt-2 w-96 shadow-lg border z-50">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Notificações</h3>
          <span className="text-sm text-muted-foreground">
            {movements.length > 0 ? `${Math.min(movements.length, 5)} de ${movements.length}` : '0'}
          </span>
        </div>
      </div>
      
      <ScrollArea className="h-[400px]">
        {latestMovements.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <p>Nenhuma notificação</p>
          </div>
        ) : (
          <div className="divide-y">
            {latestMovements.map((movement) => (
              <div key={movement.id} className="p-4 hover:bg-muted transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-medium ${getMovementTypeColor(movement.movement_type)}`}>
                        {getMovementTypeLabel(movement.movement_type)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        • {getStoreName(movement.store_id)}
                      </span>
                    </div>

                    {movement.product_id && (
                      <p className="text-sm font-medium mb-1">{getProductName(movement.product_id)}</p>
                    )}
                    
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-1">
                      <span>
                        Anterior: <span className="font-medium text-foreground">{movement.stock_before}</span>
                      </span>
                      <span>→</span>
                      <span>
                        Atual: <span className="font-medium text-foreground">{movement.stock_after}</span>
                      </span>
                      <span className={`font-medium ${movement.stock_after > movement.stock_before ? 'text-green-600' : 'text-red-600'}`}>
                        ({getStockDifference(movement.stock_before, movement.stock_after)})
                      </span>
                    </div>
                    
                    {movement.notes && (
                      <p className="text-xs text-muted-foreground italic mb-1">
                        {movement.notes}
                      </p>
                    )}
                    
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(movement.movement_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
      
      {movements.length > 5 && (
        <div className="p-3 border-t text-center">
          <button className="text-sm text-primary hover:underline">
            Ver todas as movimentações
          </button>
        </div>
      )}
    </Card>
  )
}
