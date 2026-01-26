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

const storeSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  address: z.string().min(1, "Endereço é obrigatório"),
})

type StoreFormData = z.infer<typeof storeSchema>

interface StoreDialogProps {
  onSuccess?: () => void
  onSubmit: (data: StoreFormData) => Promise<void>
  isLoading?: boolean
  trigger?: React.ReactNode | null
  defaultValues?: Partial<StoreFormData> | null
  onClose?: () => void
}

export function StoreDialog({ onSuccess, onSubmit, isLoading = false, trigger, defaultValues = null, onClose }: StoreDialogProps) {
  const [open, setOpen] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<StoreFormData>({
    resolver: zodResolver(storeSchema),
  })

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues)
      setOpen(true)
    }
  }, [defaultValues, reset])

  const handleFormSubmit = async (data: StoreFormData) => {
    try {
      await onSubmit(data)
      reset()
      setOpen(false)
      onSuccess?.()
      onClose?.()
    } catch (error) {
      console.error("Erro ao salvar loja:", error)
    }
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)

    if (!nextOpen) {
      reset()
      onClose?.()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!defaultValues && (
        <DialogTrigger asChild>
          {trigger || (
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nova Loja
            </Button>
          )}      
      </DialogTrigger>
      )}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{defaultValues ? "Editar Loja" : "Nova Loja"}</DialogTitle>
          <DialogDescription>{defaultValues ? "Edite as informações da loja" : "Adicione uma nova loja ao sistema"}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Loja</Label>
            <Input id="name" placeholder="Ex: Loja Centro" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Endereço</Label>
            <Input id="address" placeholder="Rua, número, cidade" {...register("address")} />
            {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
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
