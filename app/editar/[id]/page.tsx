import { NoteForm } from "@/components/note-form"
import { getNoteById } from "@/lib/db"
import { notFound } from "next/navigation"

export default async function EditarNotaPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  // Manejar tanto Promise<{ id: string }> como { id: string }
  const resolvedParams = await Promise.resolve(params)
  const idString = resolvedParams.id
  const id = Number.parseInt(idString)

  if (isNaN(id)) {
    notFound()
  }

  try {
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
  } catch (error) {
    console.error("Error al obtener la nota:", error)
    return (
      <div className="container py-8 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Error</h1>
        <p>No se pudo cargar la nota. Por favor, intenta de nuevo más tarde.</p>
      </div>
    )
  }
}
