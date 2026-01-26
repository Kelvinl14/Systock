"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTable } from "@/components/data-table"
import { Card } from "@/components/ui/card"
import { SupplierDialog } from "@/components/dialogs/supplier-dialog"
import { Edit, Trash2, MoreVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { 
  useSuppliers, 
  useCreateSupplier,
  useDeleteSupplier,
  useUpdateSupplier,
} from "@/lib/hooks/use-suppliers"

export default function SuppliersPage() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [editingSupplier, setEditingSupplier] = useState<any | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
    }
  }, [router])

  const { data: suppliers = [], isLoading } = useSuppliers()
  const createSupplier = useCreateSupplier()
  const updateSupplier = useUpdateSupplier()
  const deleteSupplier = useDeleteSupplier()

  const filteredSuppliers = suppliers.filter((supplier: any) =>
    supplier.name.toLowerCase().includes(search.toLowerCase()) ||
    supplier.cnpj.includes(search)
  )

  const handleAddSupplier = async (data: any) => {
    try {
      await createSupplier.mutateAsync(data)
      toast.success("Fornecedor criado com sucesso!")
    } catch (error) {
      toast.error("Erro ao criar fornecedor!")
    }
  }

  const handleUpdateSupplier = async (data: any) => {
    try {
      await updateSupplier.mutateAsync({
        id: editingSupplier.id,
        ...data,
      })
      toast.success("Fornecedor atualizado com sucesso!")
      setEditingSupplier(null)
    } catch {
      toast.error("Erro ao atualizar fornecedor.")
    }
  }

  const handleDeleteSupplier = async (id: string) => {
    try {
      await deleteSupplier.mutateAsync(id)
      toast.success("Fornecedor deletado com sucesso!")
    } catch (error) {
      toast.error("Erro ao deletar fornecedor!")
    }
  }

  const columns = [
    {
      key: "name",
      label: "Nome",
      render: (value: string) => <span className="font-medium">{value}</span>,
    },
    { key: "cnpj", label: "CNPJ" },
    { key: "contact_info", label: "Contato" },
    { key: "address", label: "Endereço" },
  ]

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Fornecedores</h1>
              <p className="text-muted-foreground">Gerencie seus fornecedores</p>
            </div>
            <SupplierDialog onSubmit={handleAddSupplier} isLoading={createSupplier.isPending} />
          </div>

          <Card className="p-6 mb-6">
            <Input 
              placeholder="Buscar fornecedor..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </Card>

          <DataTable
            data={filteredSuppliers}
            columns={columns}
            pageSize={10}
            actions={(supplier: any) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditingSupplier({ ...supplier })}>
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDeleteSupplier(supplier.id)} 
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Deletar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          />
          {editingSupplier && (
            <SupplierDialog
              defaultValues={editingSupplier}
              onSubmit={handleUpdateSupplier}
              isLoading={updateSupplier.isPending}
              onClose={() => setEditingSupplier(null)}
            />
          )}
        </main>
      </div>
    </div>
  )
}
