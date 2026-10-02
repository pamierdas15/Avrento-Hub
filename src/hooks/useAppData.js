import { useState, useEffect, useCallback } from 'react'
import { SK, FES_SK } from '../utils/constants'
import { todayStr } from '../utils/helpers'
import { restaurarPlantillas } from '../utils/backup'

function loadData() {
  const base = { alumnos: [], sesiones: [], pagos: [], tareas: {}, eventos: {} }
  try {
    const parsed = JSON.parse(localStorage.getItem(SK))
    return parsed ? { ...base, ...parsed, tareas: parsed.tareas || {}, eventos: parsed.eventos || {} } : base
  } catch {
    return base
  }
}

function loadFestivos() {
  try {
    return JSON.parse(localStorage.getItem(FES_SK)) || []
  } catch {
    return []
  }
}

export function useAppData() {
  const [data, setData] = useState(loadData)
  const [festivos, setFestivos] = useState(loadFestivos)

  useEffect(() => {
    try { localStorage.setItem(SK, JSON.stringify(data)) } catch {}
  }, [data])

  useEffect(() => {
    try { localStorage.setItem(FES_SK, JSON.stringify(festivos)) } catch {}
  }, [festivos])

  // ---- Alumnos ----
  const guardarAlumno = useCallback((alumno) => {
    setData(d => {
      const idx = d.alumnos.findIndex(a => a.id === alumno.id)
      const alumnos = idx > -1
        ? d.alumnos.map((a, i) => i === idx ? { ...a, ...alumno } : a)
        : [...d.alumnos, alumno]
      return { ...d, alumnos }
    })
  }, [])

  const eliminarAlumno = useCallback((id) => {
    setData(d => {
      const tareas = { ...(d.tareas || {}) }
      delete tareas[id]
      const eventos = { ...(d.eventos || {}) }
      delete eventos[id]
      return {
        alumnos: d.alumnos.filter(a => a.id !== id),
        sesiones: d.sesiones.filter(s => s.alumnoId !== id),
        pagos: d.pagos.filter(p => p.alumnoId !== id),
        tareas,
        eventos
      }
    })
  }, [])

  // ---- Sesiones (asistencia) ----
  const registrarSesion = useCallback((alumnoId, fecha, estado) => {
    let ok = true
    setData(d => {
      if (d.sesiones.find(s => s.alumnoId === alumnoId && s.fecha === fecha)) {
        ok = false
        return d
      }
      return { ...d, sesiones: [...d.sesiones, { id: Date.now().toString(), alumnoId, fecha, estado }] }
    })
    return ok
  }, [])

  const eliminarSesion = useCallback((id) => {
    setData(d => ({ ...d, sesiones: d.sesiones.filter(s => s.id !== id) }))
  }, [])

  // ---- Pagos ----
  const registrarPago = useCallback((pago) => {
    setData(d => ({ ...d, pagos: [...d.pagos, { id: Date.now().toString(), ...pago }] }))
  }, [])

  const eliminarPago = useCallback((id) => {
    setData(d => ({ ...d, pagos: d.pagos.filter(p => p.id !== id) }))
  }, [])

  // ---- Festivos ----
  const guardarFestivo = useCallback((festivo) => {
    setFestivos(f => [...f.filter(x => x.fecha !== festivo.fecha), festivo])
  }, [])

  const eliminarFestivo = useCallback((fecha) => {
    setFestivos(f => f.filter(x => x.fecha !== fecha))
  }, [])

  const esFestivo = useCallback((iso) => festivos.find(f => f.fecha === iso) || null, [festivos])

  // ---- Backup ----
  // "extra" (backups version 2+) trae también festivos y plantillas de WhatsApp.
  const restaurarBackup = useCallback((nuevaData, extra) => {
    setData({ alumnos: [], sesiones: [], pagos: [], tareas: {}, eventos: {}, ...nuevaData })
    if (extra) {
      if (Array.isArray(extra.festivos)) setFestivos(extra.festivos)
      restaurarPlantillas(extra)
    }
  }, [])

  // ---- Tareas pendientes (por alumno) ----
  // Cada alumno acumula una lista de tareas: { id, tarea, evento, fecha, completada }
  const guardarTarea = useCallback((alumnoId, { tarea, evento, fecha }) => {
    setData(d => {
      const actuales = (d.tareas && d.tareas[alumnoId]) || []
      const nueva = { id: Date.now().toString(), tarea, evento, fecha: fecha || todayStr(), completada: false }
      return { ...d, tareas: { ...(d.tareas || {}), [alumnoId]: [...actuales, nueva] } }
    })
  }, [])

  const eliminarTarea = useCallback((alumnoId, tareaId) => {
    setData(d => {
      const actuales = (d.tareas && d.tareas[alumnoId]) || []
      return { ...d, tareas: { ...(d.tareas || {}), [alumnoId]: actuales.filter(t => t.id !== tareaId) } }
    })
  }, [])

  // Marca/desmarca una tarea como realizada sin eliminarla de la lista.
  const marcarTarea = useCallback((alumnoId, tareaId, completada) => {
    setData(d => {
      const actuales = (d.tareas && d.tareas[alumnoId]) || []
      return { ...d, tareas: { ...(d.tareas || {}), [alumnoId]: actuales.map(t => t.id === tareaId ? { ...t, completada } : t) } }
    })
  }, [])

  // ---- Eventos próximos (por alumno) ----
  // Misma mecánica que las tareas pendientes: cada alumno acumula una lista
  // de eventos { id, tarea, evento, fecha, completada } (mismos campos: título, descripción, fecha).
  const guardarEvento = useCallback((alumnoId, { tarea, evento, fecha }) => {
    setData(d => {
      const actuales = (d.eventos && d.eventos[alumnoId]) || []
      const nuevo = { id: Date.now().toString(), tarea, evento, fecha: fecha || todayStr(), completada: false }
      return { ...d, eventos: { ...(d.eventos || {}), [alumnoId]: [...actuales, nuevo] } }
    })
  }, [])

  const eliminarEvento = useCallback((alumnoId, eventoId) => {
    setData(d => {
      const actuales = (d.eventos && d.eventos[alumnoId]) || []
      return { ...d, eventos: { ...(d.eventos || {}), [alumnoId]: actuales.filter(e => e.id !== eventoId) } }
    })
  }, [])

  // Marca/desmarca un evento como realizado sin eliminarlo de la lista.
  const marcarEvento = useCallback((alumnoId, eventoId, completada) => {
    setData(d => {
      const actuales = (d.eventos && d.eventos[alumnoId]) || []
      return { ...d, eventos: { ...(d.eventos || {}), [alumnoId]: actuales.map(e => e.id === eventoId ? { ...e, completada } : e) } }
    })
  }, [])

  return {
    data,
    festivos,
    esFestivo,
    guardarAlumno,
    eliminarAlumno,
    registrarSesion,
    eliminarSesion,
    registrarPago,
    eliminarPago,
    guardarFestivo,
    eliminarFestivo,
    restaurarBackup,
    guardarTarea,
    eliminarTarea,
    marcarTarea,
    guardarEvento,
    eliminarEvento,
    marcarEvento
  }
}
