// Importamos ambas implementaciones
import * as sqliteDb from "./db-sqlite"
import * as memoryDb from "./db-memory"

// Determinamos qué implementación usar basado en el entorno
const isVercel = process.env.VERCEL === "1"
const db = isVercel ? memoryDb : sqliteDb

// Exportamos las funciones de la implementación seleccionada
export const getNotes = db.getNotes
export const getPendingTasks = db.getPendingTasks
export const getTasksByDate = db.getTasksByDate
export const getUpcomingTasks = db.getUpcomingTasks
export const getNoteById = db.getNoteById
export const createNoteInDb = db.createNoteInDb
export const updateNoteInDb = db.updateNoteInDb
export const updateTaskStatus = db.updateTaskStatus
export const deleteNoteFromDb = db.deleteNoteFromDb
