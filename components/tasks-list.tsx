import { getNotes } from "@/lib/db"
import { TaskCard } from "./task-card"
import { EmptyNotes } from "./empty-notes"

export async function TasksList() {
  const notes = await getNotes()

  // Filtrar solo tareas
  const tasks = notes.filter((note) => note.type === "task")

  if (tasks.length === 0) {
    return <EmptyNotes type="task" />
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  )
}
