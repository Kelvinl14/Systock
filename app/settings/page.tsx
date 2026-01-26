"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { toast } from "sonner"

export default function SettingsPage() {
  const router = useRouter()

  const [apiUrl, setApiUrl] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
    }
  }, [router])

  async function testConnection() {
    console.log(apiUrl)
    if (!apiUrl) {
      toast.success("Por favor, insira a URL da API")
      return
    }
    try {
      const response = await fetch(apiUrl + "/health", { 
        method: "GET", 
        headers: {
          "Content-Type": "application/json",
        },
      })
      if (!response.ok) {
        throw new Error("Erro ao testar a conexão com a API")
      }

      toast.success("Conexão com a API testada com sucesso")
    } catch (error) {
      toast.error("Erro ao testar a conexão com a API")
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Configurações</h1>
            <p className="text-muted-foreground">Gerencie as configurações do sistema</p>
          </div>

          <Tabs defaultValue="general" className="max-w-2xl">
            <TabsList>
              <TabsTrigger value="general">Geral</TabsTrigger>
              <TabsTrigger value="users">Usuários</TabsTrigger>
              <TabsTrigger value="api">API</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Informações da Empresa</CardTitle>
                  <CardDescription>Dados gerais do seu negócio</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nome da Empresa</Label>
                    <Input defaultValue="Sua Empresa LTDA" />
                  </div>
                  <div className="space-y-2">
                    <Label>CNPJ</Label>
                    <Input defaultValue="12.345.678/0001-99" />
                  </div>
                  <Button>Salvar Alterações</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Gerenciar Usuários</CardTitle>
                  <CardDescription>Controle de acesso e permissões</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Funcionalidade de gerenciamento de usuários em desenvolvimento.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="api" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Configuração da API</CardTitle>
                  <CardDescription>Integração com sua API REST</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>URL da API</Label>
                    <Input 
                      placeholder="https://api.exemplo.com"
                      value={apiUrl}
                      onChange={(e) => setApiUrl(e.target.value)}
                      />
                  </div>
                  <div className="space-y-2">
                    <Label>Chave de API</Label>
                    <Input type="password" placeholder="sua-chave-de-api" />
                  </div>
                  <Button onClick={testConnection}>Testar Conexão</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
