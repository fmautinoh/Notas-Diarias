"use client"

import { useState, useEffect } from "react"
import { differenceInHours, parseISO } from "date-fns"
import { Bell, BellOff, BellDot } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { getUpcomingTasks } from "@/lib/actions"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function TaskNotifications() {
  const [mounted, setMounted] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | "unknown">("unknown")
  const [isSupported, setIsSupported] = useState(false)
  const [isSecureContext, setIsSecureContext] = useState(false)
  const { toast } = useToast()

  // Solo ejecutar código del lado del cliente después del montaje
  useEffect(() => {
    setMounted(true)

    // Verificar si estamos en un contexto seguro
    if (typeof window !== "undefined") {
      setIsSecureContext(window.isSecureContext)
    }

    // Verificar si las notificaciones están soportadas
    if (typeof window !== "undefined" && "Notification" in window) {
      setIsSupported(true)
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
    if (!isSupported) {
      toast({
        title: "Notificaciones no soportadas",
        description: "Tu navegador no soporta notificaciones de escritorio.",
        variant: "destructive",
      })
      return
    }

    if (!isSecureContext) {
      toast({
        title: "Contexto no seguro",
        description: "Las notificaciones requieren un contexto seguro (HTTPS).",
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
      } else if (permission === "denied") {
        toast({
          title: "Permiso denegado",
          description: "Has bloqueado las notificaciones. Revisa la configuración de tu navegador.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Permiso pendiente",
          description: "No has tomado una decisión sobre las notificaciones.",
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
    if (!mounted || !notificationsEnabled || notificationPermission !== "granted") return

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
            // Verificar si ya se ha notificado esta tarea
            const notifiedTasks = JSON.parse(localStorage.getItem("notifiedTasks") || "[]")
            if (!notifiedTasks.includes(task.id)) {
              try {
                new Notification("Tarea próxima a vencer", {
                  body: `"${task.title}" vence en aproximadamente 24 horas.`,
                  icon: "/favicon.ico",
                  tag: `task-${task.id}`, // Evitar notificaciones duplicadas
                })

                // Guardar que ya se ha notificado esta tarea
                notifiedTasks.push(task.id)
                localStorage.setItem("notifiedTasks", JSON.stringify(notifiedTasks))
              } catch (error) {
                console.error("Error al mostrar notificación:", error)
              }
            }
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
  }, [mounted, notificationsEnabled, notificationPermission])

  // No renderizar nada en el servidor o antes del montaje en el cliente
  if (!mounted) {
    return (
      <Button variant="outline" size="icon">
        <span className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Cargando notificaciones</span>
      </Button>
    )
  }

  // Si no hay soporte para notificaciones o no estamos en un contexto seguro, mostrar un botón deshabilitado
  if (!isSupported || !isSecureContext) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" disabled>
              <BellOff className="h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">Notificaciones no disponibles</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {!isSupported ? "Tu navegador no soporta notificaciones" : "Las notificaciones requieren HTTPS"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // Si el permiso ha sido denegado, mostrar un botón especial
  if (notificationPermission === "denied") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                toast({
                  title: "Notificaciones bloqueadas",
                  description:
                    "Has bloqueado las notificaciones. Revisa la configuración de tu navegador para permitirlas.",
                  variant: "destructive",
                })
              }}
            >
              <BellDot className="h-[1.2rem] w-[1.2rem] text-destructive" />
              <span className="sr-only">Notificaciones bloqueadas</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Notificaciones bloqueadas. Revisa la configuración de tu navegador.</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" onClick={toggleNotifications}>
            {notificationsEnabled ? (
              <Bell className="h-[1.2rem] w-[1.2rem]" />
            ) : (
              <BellOff className="h-[1.2rem] w-[1.2rem]" />
            )}
            <span className="sr-only">
              {notificationsEnabled ? "Desactivar notificaciones" : "Activar notificaciones"}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {notificationPermission === "granted"
            ? notificationsEnabled
              ? "Desactivar notificaciones"
              : "Activar notificaciones"
            : "Solicitar permiso para notificaciones"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
