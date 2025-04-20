import Link from "next/link"
import { FileText, CheckSquare } from "lucide-react"

import { Button } from "@/components/ui/button"

export function EmptyNotes({ type }: { type?: string }) {
  const isTask = type === "task"
  const isNote = type === "note"

  const icon = isTask ? (
    <CheckSquare className="h-10 w-10 text-muted-foreground" />
  ) : (
    <FileText className="h-10 w-10 text-muted-foreground" />
  )
  const title = isTask ? "No hay tareas" : isNote ? "No hay notas" : "No hay notas ni tareas"
  const description = isTask
    ? "Aún no has creado ninguna tarea. Comienza creando tu primera tarea para organizar tus actividades."
    : isNote
      ? "Aún no has creado ninguna nota. Comienza creando tu primera nota para organizar tus ideas."
      : "Aún no has creado ninguna nota o tarea. Comienza creando tu primera entrada para organizar tus ideas y actividades."

  const linkHref = isTask ? "/nueva?type=task" : isNote ? "/nueva?type=note" : "/nueva"
  const buttonText = isTask ? "Crear primera tarea" : isNote ? "Crear primera nota" : "Crear primera entrada"
  const buttonIcon = isTask ? <CheckSquare className="mr-2 h-4 w-4" /> : <FileText className="mr-2 h-4 w-4" />

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-6 mb-4">{icon}</div>
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      <Link href={linkHref}>
        <Button>
          {buttonIcon}
          {buttonText}
        </Button>
      </Link>
    </div>
  )
}
