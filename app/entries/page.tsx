"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Input } from "@/components/ui/input"
import { DataTable } from "@/components/data-table"
import { Card } from "@/components/ui/card"
import { EntryDialog } from "@/components/dialogs/entry-dialog"
import { toast } from "sonner"
import { useEntries, useCreateEntry } from "@/lib/hooks/use-entries"
import { useSuppliers } from "@/lib/hooks/use-suppliers"
import { format } from "date-fns"

export default function EntriesPage() {
  const router = useRouter()
  const [search, setSearch] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
    }
  }, [router])

  const { data: entries = [], isLoading } = useEntries()
  const { data: suppliers = [] } = useSuppliers()
  const createEntry = useCreateEntry()

  const getSupplierName = (supplierId: number) => {
    const supplier = suppliers.find((s: any) => s.id === supplierId)
    return supplier?.name || "—"
  }

  const filteredEntries = entries.filter((entry: any) => {
    const supplierName = getSupplierName(entry.supplier_id)
    return (
      supplierName.toLowerCase().includes(search.toLowerCase()) ||
      entry.invoice_number?.toLowerCase().includes(search.toLowerCase())
    )
  })

  const handleAddEntry = async (data: any) => {
    try {
      await createEntry.mutateAsync(data)
      toast.success("Entrada registrada com sucesso!")
    } catch (error) {
      toast.error("Erro ao registrar entrada!")
    }
  }

  const columns = [
    {
      key: "supplier_id",
      label: "Fornecedor",
      render: (value: number) => <span className="font-medium">{getSupplierName(value)}</span>,
    },
    { key: "invoice_number", label: "Nota Fiscal" },
    {
      key: "items",
      label: "Itens",
      render: (value: any[]) => <span>{value?.length || 0} itens</span>,
    },
    {
      key: "total_value",
      label: "Total",
      render: (value: number) => `R$ ${(value ?? 0).toFixed(2)}`,
    },
    {
      key: "entry_date",
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
      key: "status",
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
          {value === "completed" ? "Concluído" : value === "pending" ? "Pendente" : value}
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
              <h1 className="text-3xl font-bold">Entradas de Produtos</h1>
              <p className="text-muted-foreground">Registre compras recebidas</p>
            </div>
            <EntryDialog onSubmit={handleAddEntry} isLoading={createEntry.isPending} />
          </div>

          <Card className="p-6 mb-6">
            <Input
              placeholder="Buscar por fornecedor ou nota fiscal..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Card>

          <DataTable data={filteredEntries} columns={columns} pageSize={10} />
        </main>
      </div>
    </div>
  )
}
