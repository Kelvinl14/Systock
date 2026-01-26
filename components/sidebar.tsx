"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  Layers,
  Users,
  TrendingUp,
  Truck,
  ShoppingCart,
  Archive,
  Store,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Package, label: "Produtos", href: "/products" },
  { icon: Layers, label: "Categorias", href: "/categories" },
  { icon: Users, label: "Clientes", href: "/clients" },
  { icon: Truck, label: "Fornecedores", href: "/suppliers" },
  { icon: Store, label: "Lojas", href: "/stores" },
  { icon: Archive, label: "Entradas", href: "/entries" },
  { icon: TrendingUp, label: "Distribuição", href: "/distribution" },
  { icon: ShoppingCart, label: "Vendas", href: "/sales" },
  { icon: LayoutDashboard, label: "Movimentações", href: "/movements" },
  { icon: Store, label: "Estoque por Loja", href: "/stock-by-store" },
  { icon: Settings, label: "Configurações", href: "/settings" },
]

export function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(true)

  return (
    <>
      <aside
        className={`bg-primary text-primary-foreground transition-all duration-300 ${open ? "w-64" : "w-20"} fixed h-screen left-0 top-0 z-40 flex flex-col`}
      >
        <div className="flex items-center justify-between p-4 border-b border-primary-foreground/10">
          <Link href="/" className="flex items-center gap-2">
            <Package className="w-6 h-6" />
            {open && <span className="font-bold text-lg">SyStock</span>}
          </Link>
          <button onClick={() => setOpen(!open)} className="p-1 hover:bg-primary-foreground/10 rounded">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  isActive ? "bg-primary-foreground/20" : "hover:bg-primary-foreground/10"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {open && <span className="text-sm">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-primary-foreground/10">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-primary-foreground hover:bg-primary-foreground/10"
            onClick={() => {
              localStorage.removeItem("token")
              window.location.href = "/login"
            }}
          >
            <LogOut className="w-5 h-5 mr-2" />
            {open && "Sair"}
          </Button>
        </div>
      </aside>
      <div className={`transition-all duration-300 ${open ? "ml-64" : "ml-20"}`} />
    </>
  )
}
