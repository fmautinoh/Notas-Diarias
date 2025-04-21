"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { differenceInHours, parseISO } from "date-fns"
import { getUpcomingTasks } from "@/lib/actions"

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  // Solo ejecutar código del lado del cliente después del montaje
  useEffect(() => {
    setMounted(true)

    // Verificar si las notificaciones están habilitadas
    const notificationsEnabled = localStorage.getItem("notificationsEnabled") === "true"
    if (!notificationsEnabled) return

    // Verificar si las notificaciones están soportadas
    const notificationsSupported = typeof window !== "undefined" && "Notification" in window
    if (!notificationsSupported) return

    // Verificar si tenemos permiso
    if (Notification.permission !== "granted") return

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
              new Notification("Tarea próxima a vencer", {
                body: `"${task.title}" vence en aproximadamente 24 horas.`,
                icon: "/favicon.ico",
                tag: `task-${task.id}`, // Evitar notificaciones duplicadas
              })

              // Guardar que ya se ha notificado esta tarea
              notifiedTasks.push(task.id)
              localStorage.setItem("notifiedTasks", JSON.stringify(notifiedTasks))
            }
          }
        })
      } catch (error) {
        console.error("Error al verificar tareas próximas:", error)
      }
    }

    // Verificar inmediatamente al cargar
    checkUpcomingTasks()

    // Configurar verificación periódica (cada 30 minutos)
    const intervalId = setInterval(checkUpcomingTasks, 30 * 60 * 1000)

    // Limpiar intervalo al desmontar
    return () => clearInterval(intervalId)
  }, [mounted])

  return <>{children}</>
}
