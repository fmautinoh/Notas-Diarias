"use client"

import { useState } from "react"
import Link from "next/link"
import { Edit, Trash2, Calendar, CheckCircle, Circle } from "lucide-react"
import { formatDistanceToNow, format, isPast, isToday, isTomorrow } from "date-fns"
import { es } from "date-fns/locale"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { deleteNote, toggleTaskStatus } from "@/lib/actions"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Task {
  id: number
  title: string
  content: string
  type: string
  due_date: string | null
  priority: string
  status: string
  created_at: string
}

const priorityColors = {
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  normal: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  high: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
  urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

export function TaskCard({ task }: { task: Task }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await deleteNote(task.id)
    } catch (error) {
      console.error("Error al eliminar:", error)
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const handleToggleStatus = async () => {
    try {
      setIsUpdatingStatus(true)
      await toggleTaskStatus(task.id, task.status)
    } catch (error) {
      console.error("Error al cambiar estado:", error)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const createdAt = new Date(task.created_at)
  const timeAgo = formatDistanceToNow(createdAt, { addSuffix: true, locale: es })

  // Formatear fecha de vencimiento
  let dueDateDisplay = null
  let dueDateClass = ""

  if (task.due_date) {
    const dueDate = new Date(task.due_date)

    if (isToday(dueDate)) {
      dueDateDisplay = "Hoy"
      dueDateClass = "text-amber-600 dark:text-amber-400 font-medium"
    } else if (isTomorrow(dueDate)) {
      dueDateDisplay = "Mañana"
      dueDateClass = "text-blue-600 dark:text-blue-400 font-medium"
    } else if (isPast(dueDate) && task.status !== "completed") {
      dueDateDisplay = format(dueDate, "d MMM", { locale: es })
      dueDateClass = "text-red-600 dark:text-red-400 font-medium"
    } else {
      dueDateDisplay = format(dueDate, "d MMM", { locale: es })
    }
  }

  return (
    <>
      <Card className={task.status === "completed" ? "opacity-75" : ""}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleToggleStatus}
                disabled={isUpdatingStatus}
              >
                {task.status === "completed" ? (
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
                <span className="sr-only">
                  {task.status === "completed" ? "Marcar como pendiente" : "Marcar como completada"}
                </span>
              </Button>
              <CardTitle className={task.status === "completed" ? "line-through text-muted-foreground" : ""}>
                {task.title}
              </CardTitle>
            </div>
            <Badge className={priorityColors[task.priority as keyof typeof priorityColors]}>
              {task.priority === "low" && "Baja"}
              {task.priority === "normal" && "Normal"}
              {task.priority === "high" && "Alta"}
              {task.priority === "urgent" && "Urgente"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p
            className={`whitespace-pre-wrap ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}
          >
            {task.content.length > 150 ? `${task.content.substring(0, 150)}...` : task.content}
          </p>

          {task.due_date && (
            <div className="flex items-center mt-3 text-sm">
              <Calendar className="h-4 w-4 mr-1" />
              <span className={dueDateClass}>{dueDateDisplay}</span>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-xs text-muted-foreground">{timeAgo}</p>
          <div className="flex gap-2">
            <Link href={`/editar/${task.id}`}>
              <Button size="sm" variant="outline">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              size="sm"
              variant="outline"
              className="text-destructive"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente esta tarea.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
