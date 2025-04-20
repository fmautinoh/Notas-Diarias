import { NoteForm } from "@/components/note-form"

export default function NuevaNotaPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  return (
    <div className="container py-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Crear Nueva Entrada</h1>
      <NoteForm initialType={searchParams.type} />
    </div>
  )
}
