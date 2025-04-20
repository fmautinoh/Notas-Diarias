// Base de datos en memoria para entornos sin acceso a sistema de archivos

// Estructura de datos para almacenar notas y tareas
const notes: any[] = [
  {
    id: 1,
    title: "Bienvenido a Notas Diarias",
    content: "Esta es una aplicación para gestionar tus notas y tareas diarias.",
    type: "note",
    due_date: null,
    priority: "normal",
    status: "pending",
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    title: "Ejemplo de tarea",
    content: "Esta es una tarea de ejemplo. Puedes marcarla como completada.",
    type: "task",
    due_date: new Date(Date.now() + 86400000).toISOString(), // Mañana
    priority: "normal",
    status: "pending",
    created_at: new Date().toISOString(),
  },
]

let nextId = 3

// Obtener todas las notas
export async function getNotes() {
  return [...notes].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

// Obtener tareas pendientes
export async function getPendingTasks() {
  return notes
    .filter((note) => note.type === "task" && note.status === "pending")
    .sort((a, b) => {
      if (!a.due_date) return 1
      if (!b.due_date) return -1
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    })
}

// Obtener tareas para una fecha específica
export async function getTasksByDate(date: string) {
  const targetDate = new Date(date)
  targetDate.setHours(0, 0, 0, 0)

  return notes.filter((note) => {
    if (note.type !== "task" || !note.due_date) return false

    const noteDate = new Date(note.due_date)
    noteDate.setHours(0, 0, 0, 0)

    return noteDate.getTime() === targetDate.getTime()
  })
}

// Obtener tareas próximas (7 días)
export async function getUpcomingTasks() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)

  return notes
    .filter((note) => {
      if (note.type !== "task" || note.status !== "pending" || !note.due_date) return false

      const dueDate = new Date(note.due_date)
      dueDate.setHours(0, 0, 0, 0)

      return dueDate >= today && dueDate <= nextWeek
    })
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
}

// Obtener una nota por ID
export async function getNoteById(id: number) {
  return notes.find((note) => note.id === id) || null
}

// Crear una nueva nota o tarea
export async function createNoteInDb(data: {
  title: string
  content: string
  type: string
  due_date?: string
  priority?: string
}) {
  const { title, content, type, due_date = null, priority = "normal" } = data

  const newNote = {
    id: nextId++,
    title,
    content,
    type,
    due_date,
    priority,
    status: "pending",
    created_at: new Date().toISOString(),
  }

  notes.push(newNote)
  return newNote.id
}

// Actualizar una nota o tarea existente
export async function updateNoteInDb(
  id: number,
  data: {
    title: string
    content: string
    type: string
    due_date?: string
    priority?: string
    status?: string
  },
) {
  const { title, content, type, due_date = null, priority = "normal", status = "pending" } = data

  const index = notes.findIndex((note) => note.id === id)
  if (index === -1) return false

  notes[index] = {
    ...notes[index],
    title,
    content,
    type,
    due_date,
    priority,
    status,
  }

  return true
}

// Actualizar solo el estado de una tarea
export async function updateTaskStatus(id: number, status: string) {
  const index = notes.findIndex((note) => note.id === id)
  if (index === -1) return false

  notes[index] = {
    ...notes[index],
    status,
  }

  return true
}

// Eliminar una nota o tarea
export async function deleteNoteFromDb(id: number) {
  const index = notes.findIndex((note) => note.id === id)
  if (index === -1) return false

  notes.splice(index, 1)
  return true
}
