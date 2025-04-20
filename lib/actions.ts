"use server"

import { revalidatePath } from "next/cache"
import {
  createNoteInDb,
  updateNoteInDb,
  deleteNoteFromDb,
  updateTaskStatus,
  getTasksByDate as getTasksByDateFromDb,
  getUpcomingTasks as getUpcomingTasksFromDb,
} from "./db"

// Crear una nueva nota o tarea
export async function createNote(data: {
  title: string
  content: string
  type: string
  due_date?: string
  priority?: string
}) {
  try {
    await createNoteInDb(data)
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error al crear:", error)
    return { success: false, error: "No se pudo crear" }
  }
}

// Actualizar una nota o tarea existente
export async function updateNote(
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
  try {
    await updateNoteInDb(id, data)
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error al actualizar:", error)
    return { success: false, error: "No se pudo actualizar" }
  }
}

// Actualizar solo el estado de una tarea
export async function toggleTaskStatus(id: number, currentStatus: string) {
  try {
    const newStatus = currentStatus === "completed" ? "pending" : "completed"
    await updateTaskStatus(id, newStatus)
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error al actualizar estado:", error)
    return { success: false, error: "No se pudo actualizar el estado" }
  }
}

// Eliminar una nota o tarea
export async function deleteNote(id: number) {
  try {
    await deleteNoteFromDb(id)
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error al eliminar:", error)
    return { success: false, error: "No se pudo eliminar" }
  }
}

// Obtener tareas por fecha (Server Action)
export async function getTasksByDate(date: string) {
  try {
    const tasks = await getTasksByDateFromDb(date)
    return tasks
  } catch (error) {
    console.error("Error al obtener tareas por fecha:", error)
    return []
  }
}

// Obtener tareas próximas (Server Action)
export async function getUpcomingTasks() {
  try {
    const tasks = await getUpcomingTasksFromDb()
    return tasks
  } catch (error) {
    console.error("Error al obtener tareas próximas:", error)
    return []
  }
}
