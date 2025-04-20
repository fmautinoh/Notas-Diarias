import { Suspense } from "react"
import { CalendarView } from "@/components/calendar-view"
import { LoadingNotes } from "@/components/loading-notes"

export default function CalendarioPage() {
  return (
    <div className="container py-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Calendario de Tareas</h1>

      <Suspense fallback={<LoadingNotes />}>
        <CalendarView />
      </Suspense>
    </div>
  )
}
