"use client"

import { useState, useEffect, useRef } from "react"
import { Search, Bell, Globe, UserCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { NotificationCard } from "@/components/notification-card"
import { useMovements } from "@/lib/hooks/use-movements"
import { useProducts } from "@/lib/hooks/use-products"
import { useStores } from "@/lib/hooks/use-stores"

export function Header() {
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [lastViewedId, setLastViewedId] = useState<number | null>(null)
  const notificationRef = useRef<HTMLDivElement>(null)

  // Fetch movements with auto-refresh every 10 seconds
  const { data: movements = [], refetch } = useMovements({ 
    skip: 0, 
    limit: 50 
  })

  // Set up auto-refresh
  useEffect(() => {
    const interval = setInterval(() => {
      refetch()
    }, 10000) // Refresh every 10 seconds

    return () => clearInterval(interval)
  }, [refetch])

  // Calculate unread count
  useEffect(() => {
    if (movements.length > 0 && !showNotifications) {
      const storedLastViewedId = localStorage.getItem('lastViewedMovementId')
      const lastId = storedLastViewedId ? parseInt(storedLastViewedId) : null
      
      if (lastId) {
        const unread = movements.filter((m: any) => m.id > lastId).length
        setUnreadCount(unread)
      } else {
        setUnreadCount(movements.length > 0 ? movements.length : 0)
      }
    }
  }, [movements, showNotifications])

  // Handle notification click
  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications)
    
    if (!showNotifications && movements.length > 0) {
      // Mark all as read when opening
      const latestId = movements[0]?.id
      if (latestId) {
        localStorage.setItem('lastViewedMovementId', latestId.toString())
        setLastViewedId(latestId)
        setUnreadCount(0)
      }
    }
  }

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showNotifications])

  return (
    <header className="h-16 border-b border-border bg-card sticky top-0 z-30 flex items-center justify-between px-6">
      <div className="flex-1 max-w-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar produtos, clientes..." className="pl-10" />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative" ref={notificationRef}>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleNotificationClick}
            className="relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Button>
          
          {showNotifications && (
            <NotificationCard 
              movements={movements} 
              onClose={() => setShowNotifications(false)}
            />
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <UserCircle className="w-6 h-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Perfil</DropdownMenuItem>
            <DropdownMenuItem>Configurações</DropdownMenuItem>
            <DropdownMenuItem>Sair</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
