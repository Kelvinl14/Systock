"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Input } from "@/components/ui/input"
import { DataTable } from "@/components/data-table"
import { Card } from "@/components/ui/card"
import { DistributionDialog } from "@/components/dialogs/distribution-dialog"
import { useDistributions, useCreateDistribution } from "@/lib/hooks/use-distribution"
import { useStores } from "@/lib/hooks/use-stores"
import { toast } from "sonner"
import { format } from "date-fns"

export default function DistributionPage() {
  const router = useRouter()
  const [search, setSearch] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
    }
  }, [router])

  const { data: distributions = [], isLoading } = useDistributions()
  const { data: stores = [] } = useStores()
  const createDistribution = useCreateDistribution()

  const getStoreName = (id: number) => {
    const store = stores.find((s: any) => s.id === id)
    return store?.name || `Loja ${id}`
  }

  const getStatusLabel = (status: string) => {
    const statuses: Record<string, string> = {
      pending: "Pendente",
      completed: "Concluído",
      cancelled: "Cancelado",
    }
    return statuses[status] || status
  }

  const filteredDistributions = distributions.filter((dist: any) => {
    const originName = getStoreName(dist.from_store_id)
    const destName = getStoreName(dist.to_store_id)
    return (
      originName.toLowerCase().includes(search.toLowerCase()) ||
      destName.toLowerCase().includes(search.toLowerCase())
    )
  })

  const handleAddDistribution = async (data: any) => {
    try {
      await createDistribution.mutateAsync(data)
      toast.success("Distribuição registrada com sucesso!")
    } catch (error) {
      toast.error("Erro ao registrar distribuição!")
    }
  }

  const columns = [
    {
      key: "from_store_id" as const,
      label: "Loja de Origem",
      render: (value: number) => <span className="font-medium">{getStoreName(value)}</span>,
    },
    {
      key: "to_store_id" as const,
      label: "Loja de Destino",
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
      key: "distribution_date" as const,
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
      render: (value: string) => (
        <span
          className={`px-2 py-1 rounded text-sm font-medium ${
            value === "completed"
              ? "bg-green-100 text-green-700"
              : value === "pending"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {getStatusLabel(value)}
        </span>
      ),
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
              <h1 className="text-3xl font-bold">Distribuição Interna</h1>
              <p className="text-muted-foreground">Distribua produtos do estoque central para as lojas</p>
            </div>
            <DistributionDialog 
              onSubmit={handleAddDistribution} 
              isLoading={createDistribution.isPending} 
            />
          </div>

          <Card className="p-6 mb-6">
            <Input 
              placeholder="Buscar por loja de origem ou destino..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </Card>

          <DataTable data={filteredDistributions} columns={columns} pageSize={10} />
        </main>
      </div>
    </div>
  )
}
