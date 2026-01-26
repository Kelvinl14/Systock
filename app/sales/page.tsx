"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Input } from "@/components/ui/input"
import { DataTable } from "@/components/data-table"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SaleDialog } from "@/components/dialogs/sale-dialog"
import { useSales, useCreateSale } from "@/lib/hooks/use-sales"
import { useStores } from "@/lib/hooks/use-stores"
import { useClients } from "@/lib/hooks/use-clients"
import { toast } from "sonner"
import { format } from "date-fns"

export default function SalesPage() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [storeFilter, setStoreFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
    }
  }, [router])

  const { data: sales = [], isLoading } = useSales()
  const { data: stores = [] } = useStores()
  const { data: clients = [] } = useClients()
  const createSale = useCreateSale()

  const getStoreName = (id: number) => {
    const store = stores.find((s: any) => s.id === id)
    return store?.name || `Loja ${id}`
  }

  const getClientName = (id: number) => {
    const client = clients.find((c: any) => c.id === id)
    return client?.name || `Cliente ${id}`
  }

  const getStatusLabel = (status: string) => {
    const statuses: Record<string, string> = {
      pending: "Pendente",
      processing: "Processando",
      shipped: "Enviado",
      delivered: "Entregue",
      cancelled: "Cancelado",
    }
    return statuses[status] || status
  }

  const getDeliveryTypeLabel = (type: string) => {
    return type === "pickup" ? "Retirada" : "Entrega"
  }

  const filteredSales = sales.filter((sale: any) => {
    const clientName = getClientName(sale.client_id)
    const storeName = getStoreName(sale.store_id)
    
    const matchesSearch = 
      clientName.toLowerCase().includes(search.toLowerCase()) ||
      storeName.toLowerCase().includes(search.toLowerCase())
    
    const matchesStore = storeFilter === "all" || sale.store_id === Number(storeFilter)
    const matchesStatus = statusFilter === "all" || sale.status === statusFilter
    
    return matchesSearch && matchesStore && matchesStatus
  })

  const handleAddSale = async (data: any) => {
    try {
      await createSale.mutateAsync(data)
      toast.success("Venda registrada com sucesso!")
    } catch (error: any) {
      if (error?.response?.data?.detail) {
        toast.error(error.response.data.detail)
      } else {
        toast.error("Erro ao registrar venda!")
      }
      throw error
    }
  }

  const columns = [
    {
      key: "client_id" as const,
      label: "Cliente",
      render: (value: number) => <span className="font-medium">{getClientName(value)}</span>,
    },
    {
      key: "store_id" as const,
      label: "Loja",
      render: (value: number) => getStoreName(value),
    },
    {
      key: "items" as const,
      label: "Itens",
      render: (value: any[]) => {
        const totalQuantity = value?.reduce((sum, item) => sum + item.quantity, 0) || 0
        return <span>{value?.length || 0} produto(s) - {totalQuantity} un</span>
      },
    },
    {
      key: "total_value" as const,
      label: "Total",
      render: (value: number) => <span className="font-medium">R$ {(value ?? 0).toFixed(2)}</span>,
    },
    {
      key: "delivery_type" as const,
      label: "Entrega",
      render: (value: string) => getDeliveryTypeLabel(value),
    },
    {
      key: "sale_date" as const,
      label: "Data",
      render: (value: string) => {
        try {
          return format(new Date(value), "dd/MM/yyyy")
        } catch {
          return "—"
        }
      },
    },
    {
      key: "status" as const,
      label: "Status",
      render: (value: string) => {
        const colors: Record<string, string> = {
          pending: "bg-yellow-100 text-yellow-700",
          processing: "bg-blue-100 text-blue-700",
          shipped: "bg-purple-100 text-purple-700",
          delivered: "bg-green-100 text-green-700",
          cancelled: "bg-red-100 text-red-700",
        }
        return (
          <span className={`px-2 py-1 rounded text-sm font-medium ${colors[value] || "bg-gray-100 text-gray-700"}`}>
            {getStatusLabel(value)}
          </span>
        )
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
              <h1 className="text-3xl font-bold">Vendas</h1>
              <p className="text-muted-foreground">Registre e acompanhe vendas por loja</p>
            </div>
            <SaleDialog 
              onSubmit={handleAddSale} 
              isLoading={createSale.isPending} 
            />
          </div>

          <Card className="p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input 
                placeholder="Buscar por cliente ou loja..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
              />
              
              <Select value={storeFilter} onValueChange={setStoreFilter}>
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

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="processing">Processando</SelectItem>
                  <SelectItem value="shipped">Enviado</SelectItem>
                  <SelectItem value="delivered">Entregue</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          <DataTable data={filteredSales} columns={columns} pageSize={10} />
        </main>
      </div>
    </div>
  )
}
