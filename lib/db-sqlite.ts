import Database from "better-sqlite3"
import { join } from "path"

// Crear la conexión a la base de datos
let db: any

try {
  db = new Database(join(process.cwd(), "notes.db"))

  // Inicializar la base de datos con soporte para tareas
  db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      type TEXT DEFAULT 'note',
      due_date TEXT DEFAULT NULL,
      priority TEXT DEFAULT 'normal',
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `)
} catch (error) {
  console.error("Error al inicializar SQLite:", error)
  // Si hay un error, db será undefined y usaremos la implementación en memoria
}

// Obtener todas las notas y tareas
export async function getNotes() {
  if (!db) throw new Error("Database not initialized")
  const stmt = db.prepare("SELECT * FROM notes ORDER BY created_at DESC")
  return stmt.all()
}

// Obtener tareas pendientes
export async function getPendingTasks() {
  if (!db) throw new Error("Database not initialized")
  const stmt = db.prepare("SELECT * FROM notes WHERE type = 'task' AND status = 'pending' ORDER BY due_date ASC")
  return stmt.all()
}

// Obtener tareas para una fecha específica
export async function getTasksByDate(date: string) {
  if (!db) throw new Error("Database not initialized")
  const stmt = db.prepare("SELECT * FROM notes WHERE type = 'task' AND date(due_date) = date(?)")
  return stmt.all(date)
}

// Obtener tareas próximas (7 días)
export async function getUpcomingTasks() {
  if (!db) throw new Error("Database not initialized")
  const stmt = db.prepare(`
    SELECT * FROM notes 
    WHERE type = 'task' 
    AND status = 'pending' 
    AND due_date IS NOT NULL 
    AND date(due_date) BETWEEN date('now') AND date('now', '+7 days')
    ORDER BY due_date ASC
  `)
  return stmt.all()
}

// Obtener una nota o tarea por ID
export async function getNoteById(id: number) {
  if (!db) throw new Error("Database not initialized")
  const stmt = db.prepare("SELECT * FROM notes WHERE id = ?")
  return stmt.get(id)
}

// Crear una nueva nota o tarea
export async function createNoteInDb(data: {
  title: string
  content: string
  type: string
  due_date?: string
  priority?: string
}) {
  if (!db) throw new Error("Database not initialized")
  const { title, content, type, due_date = null, priority = "normal" } = data
  const stmt = db.prepare("INSERT INTO notes (title, content, type, due_date, priority) VALUES (?, ?, ?, ?, ?)")
  const result = stmt.run(title, content, type, due_date, priority)
  return result.lastInsertRowid
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
  if (!db) throw new Error("Database not initialized")
  const { title, content, type, due_date = null, priority = "normal", status = "pending" } = data
  const stmt = db.prepare(
    "UPDATE notes SET title = ?, content = ?, type = ?, due_date = ?, priority = ?, status = ? WHERE id = ?",
  )
  return stmt.run(title, content, type, due_date, priority, status, id)
}

// Actualizar solo el estado de una tarea
export async function updateTaskStatus(id: number, status: string) {
  if (!db) throw new Error("Database not initialized")
  const stmt = db.prepare("UPDATE notes SET status = ? WHERE id = ?")
  return stmt.run(status, id)
}

// Eliminar una nota o tarea
export async function deleteNoteFromDb(id: number) {
  if (!db) throw new Error("Database not initialized")
  const stmt = db.prepare("DELETE FROM notes WHERE id = ?")
  return stmt.run(id)
}
