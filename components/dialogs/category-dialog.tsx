"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"

const categorySchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  description: z.string().optional(),
})

type CategoryFormData = z.infer<typeof categorySchema>

interface CategoryDialogProps {
  onSuccess?: () => void
  onSubmit: (data: CategoryFormData) => Promise<void>
  isLoading?: boolean
  trigger?: React.ReactNode | null
  defaultValues?: Partial<CategoryFormData> | null
  onClose?: () => void
}

export function CategoryDialog({ onSuccess, onSubmit, isLoading = false, trigger, defaultValues = null, onClose }: CategoryDialogProps) {
  const [open, setOpen] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
  })

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues)
      setOpen(true)
    }
  }, [defaultValues, reset])

  const handleFormSubmit = async (data: CategoryFormData) => {
    try {
      await onSubmit(data)
      reset()
      setOpen(false)
      onSuccess?.()
      onClose?.()
    } catch (error) {
      console.error("Erro ao salvar categoria:", error)
    }
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)

    if (!nextOpen) {
      // Se estivermos no modo edição (defaultValues existe), avise o pai para limpar o editingClient
      if (defaultValues) {
        // reseta o form e avisa o pai que o modal foi fechado
        reset()
        onClose?.()
      } else {
        // modo criação: apenas reseta o formulário ao fechar
        reset()
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!defaultValues && (
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Nova Categoria
          </Button>
        )}
      </DialogTrigger>
      )}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{defaultValues ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
          <DialogDescription>{defaultValues ? "Edite as informações da categoria" : "Adicione uma nova categoria de produtos"}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" placeholder="Ex: Eletrônicos" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input id="description" placeholder="Descrição da categoria" {...register("description")} />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
