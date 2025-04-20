import Link from "next/link"
import { format, isToday, isTomorrow } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarClock } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getUpcomingTasks } from "@/lib/actions" // Importamos la Server Action

export async function UpcomingTasks() {
  const tasks = await getUpcomingTasks()

  if (tasks.length === 0) {
    return (
      <Card className="col-span-full md:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarClock className="mr-2 h-5 w-5" />
            Próximas Tareas
          </CardTitle>
          <CardDescription>No tienes tareas próximas para los siguientes 7 días</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="col-span-full md:col-span-3">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CalendarClock className="mr-2 h-5 w-5" />
          Próximas Tareas
        </CardTitle>
        <CardDescription>Tareas pendientes para los próximos 7 días</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tasks.map((task) => {
            const dueDate = new Date(task.due_date)
            let dateDisplay
            let dateClass = ""

            if (isToday(dueDate)) {
              dateDisplay = "Hoy"
              dateClass = "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
            } else if (isTomorrow(dueDate)) {
              dateDisplay = "Mañana"
              dateClass = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
            } else {
              dateDisplay = format(dueDate, "EEEE d 'de' MMMM", { locale: es })
            }

            const priorityColors = {
              low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
              normal: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
              high: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
              urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
            }

            return (
              <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Link href={`/editar/${task.id}`} className="font-medium hover:underline">
                    {task.title}
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={dateClass}>{dateDisplay}</Badge>
                    <Badge className={priorityColors[task.priority as keyof typeof priorityColors]}>
                      {task.priority === "low" && "Baja"}
                      {task.priority === "normal" && "Normal"}
                      {task.priority === "high" && "Alta"}
                      {task.priority === "urgent" && "Urgente"}
                    </Badge>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
