"use client"

import { useState, useEffect } from "react"
import { AlertCircle } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

export function NotificationDiagnostics() {
  const [mounted, setMounted] = useState(false)
  const [diagnosticResults, setDiagnosticResults] = useState<{
    supported: boolean
    permission: NotificationPermission | "unknown"
    secureContext: boolean
    browserName: string
    browserVersion: string
    os: string
  }>({
    supported: false,
    permission: "unknown",
    secureContext: false,
    browserName: "Desconocido",
    browserVersion: "Desconocido",
    os: "Desconocido",
  })
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)

    if (typeof window !== "undefined") {
      // Detectar navegador y sistema operativo
      const userAgent = navigator.userAgent
      let browserName = "Desconocido"
      let browserVersion = "Desconocido"
      let os = "Desconocido"

      // Detectar sistema operativo
      if (userAgent.indexOf("Win") !== -1) os = "Windows"
      else if (userAgent.indexOf("Mac") !== -1) os = "MacOS"
      else if (userAgent.indexOf("Linux") !== -1) os = "Linux"
      else if (userAgent.indexOf("Android") !== -1) os = "Android"
      else if (userAgent.indexOf("iOS") !== -1) os = "iOS"

      // Detectar navegador
      if (userAgent.indexOf("Chrome") !== -1) {
        browserName = "Chrome"
        browserVersion = userAgent.match(/Chrome\/([0-9.]+)/)?.[1] || "Desconocido"
      } else if (userAgent.indexOf("Firefox") !== -1) {
        browserName = "Firefox"
        browserVersion = userAgent.match(/Firefox\/([0-9.]+)/)?.[1] || "Desconocido"
      } else if (userAgent.indexOf("Safari") !== -1) {
        browserName = "Safari"
        browserVersion = userAgent.match(/Version\/([0-9.]+)/)?.[1] || "Desconocido"
      } else if (userAgent.indexOf("Edge") !== -1) {
        browserName = "Edge"
        browserVersion = userAgent.match(/Edge\/([0-9.]+)/)?.[1] || "Desconocido"
      }

      setDiagnosticResults({
        supported: "Notification" in window,
        permission: "Notification" in window ? Notification.permission : "unknown",
        secureContext: window.isSecureContext,
        browserName,
        browserVersion,
        os,
      })
    }
  }, [])

  const runDiagnostic = async () => {
    if (!mounted) return

    if (!diagnosticResults.supported) {
      toast({
        title: "Notificaciones no soportadas",
        description: "Tu navegador no soporta notificaciones de escritorio.",
        variant: "destructive",
      })
      return
    }

    if (!diagnosticResults.secureContext) {
      toast({
        title: "Contexto no seguro",
        description: "Las notificaciones requieren un contexto seguro (HTTPS).",
        variant: "destructive",
      })
      return
    }

    try {
      // Intentar solicitar permiso
      const permission = await Notification.requestPermission()

      setDiagnosticResults((prev) => ({
        ...prev,
        permission,
      }))

      if (permission === "granted") {
        toast({
          title: "Permiso concedido",
          description: "Las notificaciones están habilitadas correctamente.",
        })

        // Mostrar notificación de prueba
        new Notification("Diagnóstico completado", {
          body: "Las notificaciones están funcionando correctamente.",
          icon: "/favicon.ico",
        })
      } else if (permission === "denied") {
        toast({
          title: "Permiso denegado",
          description: "Has bloqueado las notificaciones para este sitio.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Permiso pendiente",
          description: "No has tomado una decisión sobre las notificaciones.",
          variant: "default",
        })
      }
    } catch (error) {
      console.error("Error al solicitar permiso:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al solicitar permiso para notificaciones.",
        variant: "destructive",
      })
    }
  }

  if (!mounted) {
    return <div>Cargando diagnóstico...</div>
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Diagnóstico de notificaciones</h3>

      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="font-medium">Navegador:</div>
          <div>
            {diagnosticResults.browserName} {diagnosticResults.browserVersion}
          </div>

          <div className="font-medium">Sistema operativo:</div>
          <div>{diagnosticResults.os}</div>

          <div className="font-medium">Notificaciones soportadas:</div>
          <div>{diagnosticResults.supported ? "Sí" : "No"}</div>

          <div className="font-medium">Contexto seguro (HTTPS):</div>
          <div>{diagnosticResults.secureContext ? "Sí" : "No"}</div>

          <div className="font-medium">Estado de permiso:</div>
          <div>
            {diagnosticResults.permission === "granted" && "Concedido"}
            {diagnosticResults.permission === "denied" && "Denegado"}
            {diagnosticResults.permission === "default" && "No decidido"}
            {diagnosticResults.permission === "unknown" && "Desconocido"}
          </div>
        </div>

        {diagnosticResults.permission === "denied" && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Notificaciones bloqueadas</AlertTitle>
            <AlertDescription>
              <p className="mb-2">
                Has bloqueado las notificaciones para este sitio. Para habilitarlas, sigue estos pasos:
              </p>

              {diagnosticResults.browserName === "Chrome" && (
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Haz clic en el icono de candado o información en la barra de direcciones</li>
                  <li>Busca la opción "Notificaciones"</li>
                  <li>Cambia la configuración de "Bloqueado" a "Permitir"</li>
                  <li>Recarga la página</li>
                </ol>
              )}

              {diagnosticResults.browserName === "Firefox" && (
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Haz clic en el icono de información en la barra de direcciones</li>
                  <li>Haz clic en "Permisos"</li>
                  <li>Busca "Enviar notificaciones" y cambia a "Permitir"</li>
                  <li>Recarga la página</li>
                </ol>
              )}

              {diagnosticResults.browserName === "Edge" && (
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Haz clic en el icono de candado en la barra de direcciones</li>
                  <li>Busca "Notificaciones"</li>
                  <li>Cambia la configuración a "Permitir"</li>
                  <li>Recarga la página</li>
                </ol>
              )}

              {diagnosticResults.browserName === "Safari" && (
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Abre Preferencias de Safari</li>
                  <li>Ve a la pestaña "Sitios web"</li>
                  <li>Selecciona "Notificaciones" en el panel izquierdo</li>
                  <li>Busca este sitio y cambia el permiso a "Permitir"</li>
                  <li>Recarga la página</li>
                </ol>
              )}

              {!["Chrome", "Firefox", "Edge", "Safari"].includes(diagnosticResults.browserName) && (
                <p>
                  Busca en la configuración de tu navegador la sección de permisos o notificaciones y permite las
                  notificaciones para este sitio.
                </p>
              )}
            </AlertDescription>
          </Alert>
        )}

        {!diagnosticResults.secureContext && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Contexto no seguro</AlertTitle>
            <AlertDescription>
              Las notificaciones solo funcionan en contextos seguros (HTTPS). Actualmente estás usando una conexión no
              segura (HTTP).
            </AlertDescription>
          </Alert>
        )}

        {!diagnosticResults.supported && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Notificaciones no soportadas</AlertTitle>
            <AlertDescription>
              Tu navegador no soporta notificaciones de escritorio. Intenta usar un navegador más moderno como Chrome,
              Firefox, Edge o Safari.
            </AlertDescription>
          </Alert>
        )}

        {diagnosticResults.supported && diagnosticResults.secureContext && (
          <Button onClick={runDiagnostic}>Ejecutar prueba de notificaciones</Button>
        )}
      </div>
    </div>
  )
}
