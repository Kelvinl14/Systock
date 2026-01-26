"use client"

import type React from "react"

import { use, useEffect, useState } from "react"
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

const clientSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  cpf_cnpj: z.string().min(11, "CPF/CNPJ inválido"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
})

type ClientFormData = z.infer<typeof clientSchema>

interface ClientDialogProps {
  onSuccess?: () => void
  onSubmit: (data: ClientFormData) => Promise<void>
  isLoading?: boolean
  trigger?: React.ReactNode | null
  defaultValues?: Partial<ClientFormData> | null
  onClose?: () => void
}

export function ClientDialog({ onSuccess, onSubmit, isLoading = false, trigger, defaultValues = null, onClose }: ClientDialogProps) {
  const [open, setOpen] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
  })

  // Inicializar valores da edição
  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues)
      setOpen(true)
    }
  }, [defaultValues, reset])

  const handleFormSubmit = async (data: ClientFormData) => {
    try {
      await onSubmit(data)
      reset()
      setOpen(false)
      onSuccess?.()
      onClose?.()
    } catch (error) {
      console.error("Erro ao salvar cliente:", error)
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
            Novo Cliente
          </Button>
        )}
      </DialogTrigger>
      )}
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{defaultValues ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
          <DialogDescription>{defaultValues
              ? "Atualize os dados do cliente"
              : "Adicione um novo cliente ao sistema"}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" placeholder="Ex: João Silva" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cpf_cnpj">CPF/CNPJ</Label>
            <Input id="cpf_cnpj" placeholder="000.000.000-00" {...register("cpf_cnpj")} />
            {errors.cpf_cnpj && <p className="text-sm text-destructive">{errors.cpf_cnpj.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="cliente@email.com" {...register("email")} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" placeholder="(11) 99999-9999" {...register("phone")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Endereço</Label>
            <Input id="address" placeholder="Rua, número, complemento" {...register("address")} />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => {
                setOpen(false)
                onClose?.()
              }}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : defaultValues ? "Atualizar" : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
