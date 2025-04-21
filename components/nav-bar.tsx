"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Calendar, Settings, Menu, X } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { TaskNotifications } from "@/components/task-notifications"

export function NavBar() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const routes = [
    {
      href: "/",
      label: "Inicio",
      icon: <Home className="h-4 w-4 mr-2" />,
      active: pathname === "/",
    },
    {
      href: "/calendario",
      label: "Calendario",
      icon: <Calendar className="h-4 w-4 mr-2" />,
      active: pathname === "/calendario",
    },
    {
      href: "/configuracion",
      label: "Configuración",
      icon: <Settings className="h-4 w-4 mr-2" />,
      active: pathname === "/configuracion",
    },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
      <div className="container flex items-center justify-between h-16">
        <Link href="/" className="font-bold text-xl">
          Agenda Diaria
        </Link>

        {/* Navegación para escritorio */}
        <nav className="hidden md:flex items-center gap-4">
          {routes.map((route) => (
            <Link key={route.href} href={route.href}>
              <Button variant={route.active ? "default" : "ghost"} className="flex items-center">
                {route.icon}
                {route.label}
              </Button>
            </Link>
          ))}
          <TaskNotifications />
          <ModeToggle />
        </nav>

        {/* Menú móvil */}
        <div className="md:hidden flex items-center gap-2">
          <TaskNotifications />
          <ModeToggle />
          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Menú móvil desplegable */}
      {isMenuOpen && (
        <div className="md:hidden border-t">
          <nav className="container py-4 flex flex-col gap-2">
            {routes.map((route) => (
              <Link key={route.href} href={route.href} onClick={() => setIsMenuOpen(false)}>
                <Button variant={route.active ? "default" : "ghost"} className="w-full justify-start">
                  {route.icon}
                  {route.label}
                </Button>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
