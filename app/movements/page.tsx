"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTable } from "@/components/data-table"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMovements, type MovementFilters } from "@/lib/hooks/use-movements"
import { useProducts } from "@/lib/hooks/use-products"
import { useStores } from "@/lib/hooks/use-stores"
import { format } from "date-fns"

export default function MovementsPage() {
  const router = useRouter()
  
  const [filters, setFilters] = useState<MovementFilters>({
    skip: 0,
    limit: 50,
  })
  const [movementType, setMovementType] = useState("all")
  const [referenceType, setReferenceType] = useState("all")
  const [storeId, setStoreId] = useState("all")
  const [productId, setProductId] = useState("all")

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
    }
  }, [router])

  const { data: movements = [], isLoading, refetch } = useMovements(filters)
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

  const getFriendlyType = (type: string) => {
    const types: Record<string, string> = {
      'IN': 'Entrada',
      'OUT': 'Saída',
      'TRANSFER': 'Transferência',
      'ADJUSTMENT': 'Ajuste',
    }
    return types[type] || type
  }

  const getFriendlyReferenceType = (type: string) => {
    const types: Record<string, string> = {
      'SALE': 'Venda',
      'PURCHASE': 'Compra',
      'ORDER': 'Pedido',
      'RETURN': 'Devolução',
      'TRANSFER': 'Transferência',
      'ENTRY': 'Entrada',
    }
    return types[type] || type
  }

  const handleFilter = () => {
    const newFilters: MovementFilters = {
      skip: 0,
      limit: 50,
    }
    
    if (movementType !== "all") {
      newFilters.movement_type = movementType
    }
    if (referenceType !== "all") {
      newFilters.reference_type = referenceType
    }
    if (storeId !== "all") {
      newFilters.store_id = Number(storeId)
    }
    if (productId !== "all") {
      newFilters.product_id = Number(productId)
    }

    setFilters(newFilters)
  }

  const handleClearFilters = () => {
    setMovementType("all")
    setReferenceType("all")
    setStoreId("all")
    setProductId("all")
    setFilters({ skip: 0, limit: 50 })
  }

  const columns = [
    { 
      key: "product_id" as const, 
      label: "Produto",
      render: (value: number) => <span className="font-medium">{getProductName(value)}</span>,
    },
    { 
      key: "store_id" as const, 
      label: "Loja",
      render: (value: number) => getStoreName(value),
    },
    { 
      key: "movement_type" as const, 
      label: "Tipo",
      render: (value: string) => {
        const isIn = value === 'IN'
        return (
          <span className={`px-2 py-1 rounded text-sm font-medium ${
            isIn ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {getFriendlyType(value)}
          </span>
        )
      },
    },
    // {
    //   key: "quantity" as const,
    //   label: "Quantidade",
    //   render: (value: number, row: any) => {
    //     const isPositive = row.movement_type === 'IN'
    //     return (
    //       <span className={isPositive ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
    //         {isPositive ? "+" : "-"}{Math.abs(value)}
    //       </span>
    //     )
    //   },
    // },
    {
      key: "stock_before" as const,
      label: "Estoque Anterior",
      render: (value: number) => value,
    },
    {
      key: "stock_after" as const,
      label: "Estoque Atual",
      render: (value: number) => value,
    },
    { 
      key: "movement_date" as const, 
      label: "Data",
      render: (value: string) => {
        try {
          return format(new Date(value), "dd/MM/yyyy HH:mm")
        } catch {
          return "—"
        }
      },
    },
  ]

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Movimentações de Estoque</h1>
              <p className="text-muted-foreground">Auditoria e histórico de movimentações</p>
            </div>
            <Button onClick={() => refetch()} variant="outline">
              Atualizar
            </Button>
          </div>

          <Card className="p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <Select value={movementType} onValueChange={setMovementType}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de Movimento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  <SelectItem value="IN">Entrada</SelectItem>
                  <SelectItem value="OUT">Saída</SelectItem>
                  <SelectItem value="TRANSFER">Transferência</SelectItem>
                  <SelectItem value="ADJUSTMENT">Ajuste</SelectItem>
                </SelectContent>
              </Select>

              <Select value={referenceType} onValueChange={setReferenceType}>
                <SelectTrigger>
                  <SelectValue placeholder="Referência" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Referências</SelectItem>
                  <SelectItem value="SALE">Venda</SelectItem>
                  <SelectItem value="PURCHASE">Compra</SelectItem>
                  <SelectItem value="ENTRY">Entrada</SelectItem>
                  <SelectItem value="RETURN">Devolução</SelectItem>
                  <SelectItem value="TRANSFER">Transferência</SelectItem>
                </SelectContent>
              </Select>

              <Select value={storeId} onValueChange={setStoreId}>
                <SelectTrigger>
                  <SelectValue placeholder="Loja" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Lojas</SelectItem>
                  {stores?.map((store: any) => (
                    <SelectItem key={store.id} value={String(store.id)}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={productId} onValueChange={setProductId}>
                <SelectTrigger>
                  <SelectValue placeholder="Produto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Produtos</SelectItem>
                  {products?.map((product: any) => (
                    <SelectItem key={product.id} value={String(product.id)}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button onClick={handleFilter}>
                Filtrar
              </Button>
              <Button variant="outline" onClick={handleClearFilters}>
                Limpar
              </Button>
            </div>
          </Card>

          <DataTable 
            data={movements} 
            columns={columns} 
            pageSize={10}
          />
        </main>
      </div>
    </div>
  )
}
