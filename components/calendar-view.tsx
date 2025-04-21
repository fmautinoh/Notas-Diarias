"use client"

import { useState, useEffect } from "react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  startOfWeek,
  endOfWeek,
  addDays,
} from "date-fns"
import { es } from "date-fns/locale"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getTasksByDate } from "@/lib/actions" // Importamos la Server Action

export function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [tasks, setTasks] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Obtenemos el primer día del mes
  const monthStart = startOfMonth(currentMonth)

  // Obtenemos el último día del mes
  const monthEnd = endOfMonth(currentMonth)

  // Obtenemos el primer día de la semana del primer día del mes
  // Usamos 1 como inicio de semana (lunes) para la localización española
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })

  // Obtenemos el último día de la semana del último día del mes
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

  // Generamos todos los días que se mostrarán en el calendario
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate })

  // Días de la semana en español, comenzando por lunes
  const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

  const prevMonth = () => {
    setCurrentMonth((prev) => addDays(prev, -30))
  }

  const nextMonth = () => {
    setCurrentMonth((prev) => addDays(prev, 30))
  }

  const fetchTasksForDate = async (date) => {
    setIsLoading(true)
    try {
      const formattedDate = format(date, "yyyy-MM-dd")
      const tasksForDate = await getTasksByDate(formattedDate) // Usamos la Server Action
      setTasks(tasksForDate)
    } catch (error) {
      console.error("Error al obtener tareas:", error)
      setTasks([])
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar tareas al iniciar o cambiar la fecha seleccionada
  useEffect(() => {
    fetchTasksForDate(selectedDate)
  }, [selectedDate])

  const handleDateClick = (day) => {
    setSelectedDate(day)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="md:col-span-2">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{format(currentMonth, "MMMM yyyy", { locale: es })}</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day) => (
              <div key={day} className="text-center font-medium text-sm py-2">
                {day}
              </div>
            ))}

            {calendarDays.map((day) => {
              const isCurrentMonth = isSameMonth(day, currentMonth)
              const isSelected = isSameDay(day, selectedDate)
              const isTodayDate = isToday(day)

              return (
                <Button
                  key={day.toString()}
                  variant="ghost"
                  className={`
                    h-12 rounded-md
                    ${!isCurrentMonth ? "text-muted-foreground opacity-50" : ""}
                    ${isSelected ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" : ""}
                    ${isTodayDate && !isSelected ? "border border-primary" : ""}
                  `}
                  onClick={() => handleDateClick(day)}
                >
                  {format(day, "d")}
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-medium mb-4">
            Tareas para {format(selectedDate, "d 'de' MMMM", { locale: es })}
          </h3>

          {isLoading ? (
            <div className="space-y-2">
              <div className="h-12 bg-muted rounded animate-pulse" />
              <div className="h-12 bg-muted rounded animate-pulse" />
            </div>
          ) : tasks.length > 0 ? (
            <div className="space-y-2">
              {tasks.map((task) => (
                <div key={task.id} className="p-3 border rounded-lg">
                  <div className="font-medium">{task.title}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {task.content.length > 50 ? `${task.content.substring(0, 50)}...` : task.content}
                  </div>
                  <div className="mt-2">
                    <Badge
                      className={
                        task.priority === "urgent"
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                          : task.priority === "high"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
                            : task.priority === "normal"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                      }
                    >
                      {task.priority === "urgent" && "Urgente"}
                      {task.priority === "high" && "Alta"}
                      {task.priority === "normal" && "Normal"}
                      {task.priority === "low" && "Baja"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No hay tareas para este día</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
