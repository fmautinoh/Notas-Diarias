"use client"

import { useState, useEffect } from "react"
import { differenceInHours, parseISO } from "date-fns"
import { Bell, BellOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { getUpcomingTasks } from "@/lib/actions"

export function TaskNotifications() {
  const [mounted, setMounted] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | "default">("default")
  const { toast } = useToast()

  // Solo ejecutar código del lado del cliente después del montaje
  useEffect(() => {
    setMounted(true)

    // Verificar si las notificaciones están soportadas
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationPermission(Notification.permission)

      // Restaurar el estado de las notificaciones desde localStorage
      const savedState = localStorage.getItem("notificationsEnabled")
      if (savedState === "true" && Notification.permission === "granted") {
        setNotificationsEnabled(true)
      }
    }
  }, [])

  // Solicitar permiso para notificaciones
  const requestPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      toast({
        title: "Notificaciones no soportadas",
        description: "Tu navegador no soporta notificaciones de escritorio.",
        variant: "destructive",
      })
      return
    }

    try {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)

      if (permission === "granted") {
        setNotificationsEnabled(true)
        localStorage.setItem("notificationsEnabled", "true")

        toast({
          title: "Notificaciones activadas",
          description: "Recibirás alertas cuando tus tareas estén próximas a vencer.",
        })

        // Mostrar una notificación de prueba
        new Notification("Notificaciones activadas", {
          body: "Recibirás alertas cuando tus tareas estén próximas a vencer.",
          icon: "/favicon.ico",
        })
      } else {
        toast({
          title: "Permiso denegado",
          description: "No podrás recibir notificaciones de tareas próximas a vencer.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al solicitar permiso:", error)
      toast({
        title: "Error",
        description: "No se pudo solicitar permiso para notificaciones.",
        variant: "destructive",
      })
    }
  }

  // Alternar el estado de las notificaciones
  const toggleNotifications = () => {
    if (notificationPermission !== "granted") {
      requestPermission()
      return
    }

    const newState = !notificationsEnabled
    setNotificationsEnabled(newState)
    localStorage.setItem("notificationsEnabled", newState.toString())

    toast({
      title: newState ? "Notificaciones activadas" : "Notificaciones desactivadas",
      description: newState
        ? "Recibirás alertas cuando tus tareas estén próximas a vencer."
        : "No recibirás alertas de tareas próximas a vencer.",
    })
  }

  // Verificar tareas próximas a vencer
  useEffect(() => {
    if (!mounted || !notificationsEnabled) return

    // Función para verificar tareas
    const checkUpcomingTasks = async () => {
      try {
        const tasks = await getUpcomingTasks()
        const now = new Date()

        tasks.forEach((task) => {
          if (!task.due_date) return

          const dueDate = parseISO(task.due_date)
          const hoursRemaining = differenceInHours(dueDate, now)

          // Notificar si la tarea está entre 23 y 24 horas para vencer
          if (hoursRemaining >= 23 && hoursRemaining <= 24) {
            new Notification("Tarea próxima a vencer", {
              body: `"${task.title}" vence en aproximadamente 24 horas.`,
              icon: "/favicon.ico",
              tag: `task-${task.id}`, // Evitar notificaciones duplicadas
            })
          }
        })
      } catch (error) {
        console.error("Error al verificar tareas próximas:", error)
      }
    }

    // Verificar inmediatamente al activar
    checkUpcomingTasks()

    // Configurar verificación periódica (cada hora)
    const intervalId = setInterval(checkUpcomingTasks, 60 * 60 * 1000)

    // Limpiar intervalo al desmontar
    return () => clearInterval(intervalId)
  }, [mounted, notificationsEnabled])

  // No renderizar nada en el servidor o antes del montaje en el cliente
  if (!mounted) {
    return (
      <Button variant="outline" size="icon">
        <span className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Cargando notificaciones</span>
      </Button>
    )
  }

  // Verificar si las notificaciones están soportadas
  const notificationsSupported = typeof window !== "undefined" && "Notification" in window
  if (!notificationsSupported) {
    return null
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleNotifications}
      title={notificationsEnabled ? "Desactivar notificaciones" : "Activar notificaciones"}
    >
      {notificationsEnabled ? (
        <Bell className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <BellOff className="h-[1.2rem] w-[1.2rem]" />
      )}
      <span className="sr-only">{notificationsEnabled ? "Desactivar notificaciones" : "Activar notificaciones"}</span>
    </Button>
  )
}
