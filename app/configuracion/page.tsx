import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { NotificationSettings } from "@/components/notification-settings"
import { NotificationDiagnostics } from "@/components/notification-diagnostics"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ConfiguracionPage() {
  return (
    <div className="container py-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Configuración</h1>

      <Tabs defaultValue="notificaciones" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="notificaciones">Notificaciones</TabsTrigger>
          <TabsTrigger value="diagnostico">Diagnóstico</TabsTrigger>
        </TabsList>

        <TabsContent value="notificaciones">
          <Card>
            <CardHeader>
              <CardTitle>Notificaciones</CardTitle>
              <CardDescription>
                Configura cómo y cuándo quieres recibir notificaciones sobre tus tareas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diagnostico">
          <Card>
            <CardHeader>
              <CardTitle>Diagnóstico de notificaciones</CardTitle>
              <CardDescription>Verifica y soluciona problemas con las notificaciones.</CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationDiagnostics />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
