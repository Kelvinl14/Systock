"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTable } from "@/components/data-table"
import { Card } from "@/components/ui/card"
import { ClientDialog } from "@/components/dialogs/client-dialog"
import { Trash2, Edit } from "lucide-react"
import { toast } from "sonner"
import {
  useClients,
  useCreateClient,
  useDeleteClient,
  useUpdateClient,
} from "@/lib/hooks/use-clients" 


// const mockClients = [
//   { id: "1", name: "João Silva", cpf: "123.456.789-00", email: "joao@email.com", phone: "(11) 99999-8888" },
//   { id: "2", name: "Maria Santos", cpf: "987.654.321-11", email: "maria@email.com", phone: "(21) 98888-7777" },
//   {
//     id: "3",
//     name: "Tech Solutions LTDA",
//     cpf: "12.345.678/0001-99",
//     email: "contato@tech.com",
//     phone: "(31) 3333-4444",
//   },
// ]

export default function ClientsPage() {
  const router = useRouter()
  // const [clients, setClients] = useState()
  // const [search, setSearch] = useState("")

  // Valida Login
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
    }
  }, [router])

  // Busca os clientes e filtra
  const [search, setSearch] = useState("")
  const [editingClient, setEditingClient] = useState<any | null>(null)

  // const filteredClients = clients.filter(
  //   (client) =>
  //     client.name.toLowerCase().includes(search.toLowerCase()) ||
  //     client.email.toLowerCase().includes(search.toLowerCase()),
  // )

  // Hooks da API
  const { data: clients = [], isLoading } = useClients()
  const updateClient = useUpdateClient()
  const createClient = useCreateClient()
  const deleteClient = useDeleteClient()

  // Filtro local
  const filteredClients = clients.filter(
    (client: any) =>
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      client.email.toLowerCase().includes(search.toLowerCase()),
  )

  // Criar via api
  const handleAddClient = async (data: any) => {
    try {
      await createClient.mutateAsync(data)
      toast.success("Cliente criado com sucesso!")
    } catch (error) {
      toast.error("Erro ao criar cliente!")
    }
  }

  // Deleta via api
  const handleDeleteClient = async (id: number) => {
    try {
      await deleteClient.mutateAsync(id)
      toast.success("Cliente deletado com sucesso!")
    } catch (error) {
      toast.error("Erro ao deletar cliente!")
    }
  }

  // Atualiza via api
  const handleUpdateClient = async (data: any) => {
  try {
    await updateClient.mutateAsync({
      id: editingClient.id,
      ...data,
      cpf_cnpj: data.cpf_cnpj ?? data.cpf, // caso o dialog use cpf
    })

    toast.success("Cliente atualizado com sucesso!")
    setEditingClient(null)
  } catch {
    toast.error("Erro ao atualizar cliente.")
  }
}


  // const handleAddClient = async (data: any) => {
  //   const newClient = {
  //     id: String(clients.length + 1),
  //     ...data,
  //   }
  //   setClients([...clients, newClient])
  //   toast.success("Cliente criado com sucesso!")
  // }

  // const handleDeleteClient = (id: string) => {
  //   setClients(clients.filter((c) => c.id !== id))
  //   toast.success("Cliente deletado com sucesso!")
  // }

  const columns = [
    { key: "name" as const, label: "Nome" },
    { key: "cpf" as const, label: "CPF/CNPJ" },
    { key: "email" as const, label: "Email" },
    { key: "phone" as const, label: "Telefone" },
  ]

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Clientes</h1>
              <p className="text-muted-foreground">Gerencie seus clientes</p>
            </div>

            {/* Botão para criar novo cliente */}
            <ClientDialog onSubmit={handleAddClient} />
          </div>

          {/* Modal de edição — sem botão trigger */}
          {editingClient && (
            <ClientDialog
              defaultValues={{
                name: editingClient.name,
                cpf_cnpj: editingClient.cpf_cnpj,
                email: editingClient.email,
                phone: editingClient.phone,
                address: editingClient.address,
              }}
              onSubmit={handleUpdateClient}
              onClose={() => setEditingClient(null)}
              trigger={false}
            />
          )}

          <Card className="p-6 mb-6">
            <Input
              placeholder="Buscar cliente por nome ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Card>

          {/* Loading */}
          {isLoading ? (
            <p className="text-muted-foreground">Carregando clientes...</p>
          ) : (
            <DataTable
              data={filteredClients}
              columns={columns}
              actions={(client: any) => (
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setEditingClient(client)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => handleDeleteClient(client.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            />
          )}

          {/* <DataTable
            data={filteredClients}
            columns={columns}
            actions={(client) => (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => handleDeleteClient(client.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          /> */}
        </main>
      </div>
    </div>
  )
}
