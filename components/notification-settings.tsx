"use client"

import { useState, useEffect } from "react"
import { Bell, BellOff, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function NotificationSettings() {
  const [notificationsSupported, setNotificationsSupported] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | "default">("default")
  const { toast } = useToast()

  // Verificar si las notificaciones están soportadas
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationsSupported(true)
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
    if (!notificationsSupported) {
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
  const toggleNotifications = (enabled: boolean) => {
    if (notificationPermission !== "granted" && enabled) {
      requestPermission()
      return
    }

    setNotificationsEnabled(enabled)
    localStorage.setItem("notificationsEnabled", enabled.toString())

    toast({
      title: enabled ? "Notificaciones activadas" : "Notificaciones desactivadas",
      description: enabled
        ? "Recibirás alertas cuando tus tareas estén próximas a vencer."
        : "No recibirás alertas de tareas próximas a vencer.",
    })
  }

  // Mostrar una notificación de prueba
  const sendTestNotification = () => {
    if (notificationPermission !== "granted") {
      toast({
        title: "Permiso denegado",
        description: "Debes permitir notificaciones primero.",
        variant: "destructive",
      })
      return
    }

    new Notification("Notificación de prueba", {
      body: "Esta es una notificación de prueba. Las notificaciones están funcionando correctamente.",
      icon: "/favicon.ico",
    })

    toast({
      title: "Notificación enviada",
      description: "Se ha enviado una notificación de prueba.",
    })
  }

  if (!notificationsSupported) {
    return (
      <Alert variant="destructive">
        <BellOff className="h-4 w-4" />
        <AlertTitle>Notificaciones no soportadas</AlertTitle>
        <AlertDescription>
          Tu navegador no soporta notificaciones de escritorio. Intenta usar un navegador moderno como Chrome, Firefox o
          Edge.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {notificationPermission === "denied" && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Permiso denegado</AlertTitle>
          <AlertDescription>
            Has bloqueado las notificaciones para este sitio. Para recibir alertas, debes permitir notificaciones en la
            configuración de tu navegador.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="notifications">Notificaciones de tareas</Label>
          <p className="text-sm text-muted-foreground">Recibe alertas cuando tus tareas estén a 24 horas de vencer.</p>
        </div>
        <Switch
          id="notifications"
          checked={notificationsEnabled}
          onCheckedChange={toggleNotifications}
          disabled={notificationPermission === "denied"}
        />
      </div>

      <div className="flex flex-col space-y-2">
        <Button
          variant="outline"
          onClick={sendTestNotification}
          disabled={!notificationsEnabled || notificationPermission !== "granted"}
        >
          Enviar notificación de prueba
        </Button>

        {notificationPermission !== "granted" && (
          <Button onClick={requestPermission}>
            <Bell className="mr-2 h-4 w-4" />
            Solicitar permiso para notificaciones
          </Button>
        )}
      </div>

      <div className="text-sm text-muted-foreground mt-4">
        <p>
          <strong>Nota:</strong> Las notificaciones solo funcionarán cuando la aplicación esté abierta en tu navegador.
          Para recibir notificaciones incluso cuando el navegador esté cerrado, considera instalar la aplicación como
          PWA.
        </p>
      </div>
    </div>
  )
}
