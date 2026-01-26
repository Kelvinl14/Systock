"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTable } from "@/components/data-table"
import { Card } from "@/components/ui/card"
import { StoreDialog } from "@/components/dialogs/store-dialog"
import { Edit, Trash2, MoreVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { 
  useStores, 
  useCreateStore,
  useDeleteStore,
  useUpdateStore,
} from "@/lib/hooks/use-stores"

export default function StoresPage() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [editingStore, setEditingStore] = useState<any | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
    }
  }, [router])

  const { data: stores = [], isLoading } = useStores()
  const createStore = useCreateStore()
  const updateStore = useUpdateStore()
  const deleteStore = useDeleteStore()

  const filteredStores = stores.filter((store: any) =>
    store.name.toLowerCase().includes(search.toLowerCase()) ||
    store.address.toLowerCase().includes(search.toLowerCase())
  )

  const handleAddStore = async (data: any) => {
    try {
      await createStore.mutateAsync(data)
      toast.success("Loja criada com sucesso!")
    } catch (error) {
      toast.error("Erro ao criar loja!")
    }
  }

  const handleUpdateStore = async (data: any) => {
    try {
      await updateStore.mutateAsync({
        id: editingStore.id,
        ...data,
      })
      toast.success("Loja atualizada com sucesso!")
      setEditingStore(null)
    } catch {
      toast.error("Erro ao atualizar loja.")
    }
  }

  const handleDeleteStore = async (id: string) => {
    try {
      await deleteStore.mutateAsync(id)
      toast.success("Loja deletada com sucesso!")
    } catch (error) {
      toast.error("Erro ao deletar loja!")
    }
  }

  const columns = [
    {
      key: "name",
      label: "Nome",
      render: (value: string) => <span className="font-medium">{value}</span>,
    },
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
              <h1 className="text-3xl font-bold">Lojas</h1>
              <p className="text-muted-foreground">Gerencie suas lojas</p>
            </div>
            <StoreDialog onSubmit={handleAddStore} isLoading={createStore.isPending} />
          </div>

          <Card className="p-6 mb-6">
            <Input 
              placeholder="Buscar loja..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </Card>

          <DataTable
            data={filteredStores}
            columns={columns}
            pageSize={10}
            actions={(store: any) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditingStore({ ...store })}>
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDeleteStore(store.id)} 
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Deletar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          />
          {editingStore && (
            <StoreDialog
              defaultValues={editingStore}
              onSubmit={handleUpdateStore}
              isLoading={updateStore.isPending}
              onClose={() => setEditingStore(null)}
            />
          )}
        </main>
      </div>
    </div>
  )
}
