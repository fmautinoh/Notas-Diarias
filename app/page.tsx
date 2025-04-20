import { Suspense } from "react"
import Link from "next/link"
import { FileText, CheckSquare } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NotesList } from "@/components/notes-list"
import { TasksList } from "@/components/tasks-list"
import { UpcomingTasks } from "@/components/upcoming-tasks"
import { LoadingNotes } from "@/components/loading-notes"

export default function Home() {
  return (
    <div className="container py-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Mi Agenda Diaria</h1>
        <div className="flex gap-2">
          <Link href="/nueva?type=note">
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Nueva Nota
            </Button>
          </Link>
          <Link href="/nueva?type=task">
            <Button>
              <CheckSquare className="mr-2 h-4 w-4" />
              Nueva Tarea
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Suspense fallback={<LoadingNotes />}>
          <UpcomingTasks />
        </Suspense>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">Todo</TabsTrigger>
          <TabsTrigger value="notes">Notas</TabsTrigger>
          <TabsTrigger value="tasks">Tareas</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <Suspense fallback={<LoadingNotes />}>
            <NotesList />
          </Suspense>
        </TabsContent>
        <TabsContent value="notes">
          <Suspense fallback={<LoadingNotes />}>
            <NotesList type="note" />
          </Suspense>
        </TabsContent>
        <TabsContent value="tasks">
          <Suspense fallback={<LoadingNotes />}>
            <TasksList />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}
