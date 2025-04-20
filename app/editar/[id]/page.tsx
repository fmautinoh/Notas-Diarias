import { NoteForm } from "@/components/note-form"
import { getNoteById } from "@/lib/db"
import { notFound } from "next/navigation"

// Actualizar la función para usar await con params
export default async function EditarNotaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idString } = await params
  const id = Number.parseInt(idString)

  if (isNaN(id)) {
    notFound()
  }

  const note = await getNoteById(id)

  if (!note) {
    notFound()
  }

  return (
    <div className="container py-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Editar Nota</h1>
      <NoteForm note={note} />
    </div>
  )
}
