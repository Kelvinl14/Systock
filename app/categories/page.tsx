"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table"
import { CategoryDialog } from "@/components/dialogs/category-dialog"
import { Edit, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useCategories, useCreateCategory, useDeleteCategory, useUpdateCategory } from "@/lib/hooks/use-categories"


const mockCategories = [
  { id: "1", name: "Eletrônicos", productCount: 45 },
  { id: "2", name: "Periféricos", productCount: 28 },
  { id: "3", name: "Vestuário", productCount: 92 },
  { id: "4", name: "Móveis", productCount: 15 },
]

export default function CategoriesPage() {
  const router = useRouter()
  const { data: categories } = useCategories()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
    }
  }, [router])

  const handleAddCategory = async (data: any) => {
    try {
      await createCategory.mutateAsync(data)
      toast.success("Categoria criada com sucesso!")
    } catch (error) {
      toast.error("Erro ao criar categoria")
    }
  }

  const handleDeleteCategory = async (id: number) => {
    try {
      await deleteCategory.mutateAsync(id)
      toast.success("Categoria deletada com sucesso!")
    } catch (error) {
      toast.error("Erro ao deletar categoria")
    }
  }

  const [editingCategory, setEditingCategory] = useState(null)

  const handleUpdateCategory = async (data: any) => {
    try {
      await updateCategory.mutateAsync(data)
      toast.success("Categoria atualizada com sucesso!")
    } catch (error) {
      toast.error("Erro ao atualizar categoria")
    }
  }

  const columns = [
    {
      key: "name",
      label: "Nome",
    }
  ]

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Categorias</h1>
              <p className="text-muted-foreground">Organize seus produtos em categorias</p>
            </div>
            <CategoryDialog onSubmit={handleAddCategory} />
          </div>

          <DataTable
            data={categories ?? []}
            columns={columns}
            actions={(category: any) => (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setEditingCategory({ ...category })}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => handleDeleteCategory(Number(category.id))}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          />
          {editingCategory && (
            <CategoryDialog
              defaultValues={editingCategory}
              onSubmit={handleUpdateCategory}
              onClose={() => setEditingCategory(null)}
              trigger={false}
            />
          )}
        </main>
      </div>
    </div>
  )
}
