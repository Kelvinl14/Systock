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

const supplierSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  cnpj: z.string().min(14, "CNPJ inválido"),
  contact_info: z.string().min(1, "Contato é obrigatório"),
  address: z.string().min(1, "Endereço é obrigatório"),
})

type SupplierFormData = z.infer<typeof supplierSchema>

interface SupplierDialogProps {
  onSuccess?: () => void
  onSubmit: (data: SupplierFormData) => Promise<void>
  isLoading?: boolean
  trigger?: React.ReactNode | null
  defaultValues?: Partial<SupplierFormData> | null
  onClose?: () => void
}

export function SupplierDialog({ onSuccess, onSubmit, isLoading = false, trigger, defaultValues = null, onClose }: SupplierDialogProps) {
  const [open, setOpen] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
  })

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues)
      setOpen(true)
    }
  }, [defaultValues, reset])

  const handleFormSubmit = async (data: SupplierFormData) => {
    try {
      await onSubmit(data)
      reset()
      setOpen(false)
      onSuccess?.()
      onClose?.()
    } catch (error) {
      console.error("Erro ao salvar fornecedor:", error)
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
              Novo Fornecedor
            </Button>
          )}      
      </DialogTrigger>
      )}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{defaultValues ? "Editar Fornecedor" : "Novo Fornecedor"}</DialogTitle>
          <DialogDescription>{defaultValues ? "Edite as informações do fornecedor" : "Adicione um novo fornecedor ao sistema"}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Fornecedor</Label>
            <Input id="name" placeholder="Ex: Distribuidora XYZ" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input id="cnpj" placeholder="00.000.000/0000-00" {...register("cnpj")} />
            {errors.cnpj && <p className="text-sm text-destructive">{errors.cnpj.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_info">Contato</Label>
            <Input id="contact_info" placeholder="Telefone ou e-mail" {...register("contact_info")} />
            {errors.contact_info && <p className="text-sm text-destructive">{errors.contact_info.message}</p>}
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
