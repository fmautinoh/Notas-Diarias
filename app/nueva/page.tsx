import { NoteForm } from "@/components/note-form"

export default async function NuevaNotaPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  // Esperamos a que se resuelva searchParams antes de acceder a sus propiedades
  const resolvedParams = await searchParams
  const type = resolvedParams.type

  return (
    <div className="container py-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Crear Nueva Entrada</h1>
      <NoteForm initialType={type} />
    </div>
  )
}
