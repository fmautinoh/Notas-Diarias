import { getNotes } from "@/lib/db"
import { NoteCard } from "./note-card"
import { TaskCard } from "./task-card"
import { EmptyNotes } from "./empty-notes"

export async function NotesList({ type }: { type?: string }) {
  const notes = await getNotes()

  // Filtrar por tipo si se especifica
  const filteredNotes = type ? notes.filter((note) => note.type === type) : notes

  if (filteredNotes.length === 0) {
    return <EmptyNotes type={type} />
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredNotes.map((item) =>
        item.type === "task" ? <TaskCard key={item.id} task={item} /> : <NoteCard key={item.id} note={item} />,
      )}
    </div>
  )
}
