import { useState, useEffect, useCallback, useRef } from 'react'
import { SK, FES_SK } from '../utils/constants'
import { todayStr } from '../utils/helpers'
import { restaurarPlantillas } from '../utils/backup'
import { migrarDatos, describirCobertura } from '../utils/business'

function loadData() {
  const base = { alumnos: [], sesiones: [], pagos: [], tareas: {}, eventos: {} }
  try {
    const parsed = JSON.parse(localStorage.getItem(SK))
    return parsed ? migrarDatos({ ...base, ...parsed, tareas: parsed.tareas || {}, eventos: parsed.eventos || {} }) : base
  } catch {
    return base
  }
}

// Identificador único (Date.now() solo podía repetirse si se creaban dos
// registros en el mismo milisegundo).
function nuevoId() {
  return Date.now().toString() + Math.random().toString(36).slice(2, 6)
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

  // Copia siempre actualizada de los datos, para poder consultarlos al
  // instante (comprobar duplicados, guardar lo borrado para "Deshacer")
  // sin depender de cuándo React aplica los cambios de estado.
  const dataRef = useRef(data)
  dataRef.current = data
  const festivosRef = useRef(festivos)
  festivosRef.current = festivos

  // Cambia los datos y actualiza la copia en el mismo momento, para que dos
  // acciones seguidas (p. ej. dos toques rápidos) vean el estado correcto.
  const cambiar = useCallback((fn) => {
    const nuevo = fn(dataRef.current)
    dataRef.current = nuevo
    setData(nuevo)
  }, [])

  useEffect(() => {
    try { localStorage.setItem(SK, JSON.stringify(data)) } catch {}
  }, [data])

  useEffect(() => {
    try { localStorage.setItem(FES_SK, JSON.stringify(festivos)) } catch {}
  }, [festivos])

  // ---- Alumnos ----
  const guardarAlumno = useCallback((alumno) => {
    cambiar(d => {
      const idx = d.alumnos.findIndex(a => a.id === alumno.id)
      const alumnos = idx > -1
        ? d.alumnos.map((a, i) => i === idx ? { ...a, ...alumno } : a)
        : [...d.alumnos, alumno]
      return { ...d, alumnos }
    })
  }, [cambiar])

  // Todas las funciones "eliminar" devuelven otra función que deshace el
  // borrado (se usa en el botón "Deshacer" del aviso inferior).
  const eliminarAlumno = useCallback((id) => {
    const d0 = dataRef.current
    const idx = d0.alumnos.findIndex(a => a.id === id)
    if (idx === -1) return () => {}
    const alumno = d0.alumnos[idx]
    const sesiones = d0.sesiones.filter(s => s.alumnoId === id)
    const pagos = d0.pagos.filter(p => p.alumnoId === id)
    const tareasA = (d0.tareas || {})[id]
    const eventosA = (d0.eventos || {})[id]
    cambiar(d => {
      const tareas = { ...(d.tareas || {}) }
      delete tareas[id]
      const eventos = { ...(d.eventos || {}) }
      delete eventos[id]
      return {
        ...d,
        alumnos: d.alumnos.filter(a => a.id !== id),
        sesiones: d.sesiones.filter(s => s.alumnoId !== id),
        pagos: d.pagos.filter(p => p.alumnoId !== id),
        tareas,
        eventos
      }
    })
    return () => cambiar(d => {
      if (d.alumnos.some(a => a.id === id)) return d
      const alumnos = d.alumnos.slice()
      alumnos.splice(Math.min(idx, alumnos.length), 0, alumno)
      return {
        ...d,
        alumnos,
        sesiones: [...d.sesiones, ...sesiones],
        pagos: [...d.pagos, ...pagos],
        tareas: tareasA ? { ...(d.tareas || {}), [id]: tareasA } : d.tareas,
        eventos: eventosA ? { ...(d.eventos || {}), [id]: eventosA } : d.eventos
      }
    })
  }, [cambiar])

  // ---- Sesiones (asistencia) ----
  // Devuelve true si se ha registrado y false si ya existía un registro de
  // ese alumno en esa fecha. La comprobación se hace sobre los datos actuales
  // ANTES de modificar nada, así que la respuesta siempre es fiable.
  const registrarSesion = useCallback((alumnoId, fecha, estado) => {
    if (dataRef.current.sesiones.some(s => s.alumnoId === alumnoId && s.fecha === fecha)) return false
    cambiar(d => ({ ...d, sesiones: [...d.sesiones, { id: nuevoId(), alumnoId, fecha, estado }] }))
    return true
  }, [cambiar])

  const eliminarSesion = useCallback((id) => {
    const ses = dataRef.current.sesiones.find(s => s.id === id)
    if (!ses) return () => {}
    cambiar(d => ({ ...d, sesiones: d.sesiones.filter(s => s.id !== id) }))
    return () => cambiar(d => d.sesiones.some(s => s.id === id) ? d : { ...d, sesiones: [...d.sesiones, ses] })
  }, [cambiar])

  // ---- Pagos ----
  const registrarPago = useCallback((pago) => {
    cambiar(d => ({ ...d, pagos: [...d.pagos, { id: nuevoId(), ...pago }] }))
  }, [cambiar])

  const eliminarPago = useCallback((id) => {
    const pago = dataRef.current.pagos.find(p => p.id === id)
    if (!pago) return () => {}
    cambiar(d => ({ ...d, pagos: d.pagos.filter(p => p.id !== id) }))
    return () => cambiar(d => d.pagos.some(p => p.id === id) ? d : { ...d, pagos: [...d.pagos, pago] })
  }, [cambiar])

  // Convierte un pago anotado a mano como "⏳ Pendiente" en cobrado (con
  // fecha de hoy), calculando qué cubre igual que un pago normal.
  const marcarPagoCobrado = useCallback((id) => {
    const d0 = dataRef.current
    const original = d0.pagos.find(p => p.id === id)
    if (!original || original.tipo !== 'pendiente') return () => {}
    const alumno = d0.alumnos.find(a => a.id === original.alumnoId)
    const mod = (alumno && alumno.modalidad) || 'fija'
    let cubre = mod
    if (mod === 'fija') cubre = /clase extra/i.test(original.concepto || '') ? 'extra' : 'mes'
    let nuevo = { ...original, tipo: 'recibido', fecha: todayStr() }
    if (cubre === 'mes' && !nuevo.mesCorrespondiente) nuevo.mesCorrespondiente = original.fecha.slice(0, 7)
    if (cubre !== 'mes') delete nuevo.mesCorrespondiente
    nuevo = describirCobertura(alumno, nuevo, cubre)
    cambiar(d => ({ ...d, pagos: d.pagos.map(p => p.id === id ? nuevo : p) }))
    return () => cambiar(d => ({ ...d, pagos: d.pagos.map(p => p.id === id ? original : p) }))
  }, [cambiar])

  // ---- Festivos ----
  const guardarFestivo = useCallback((festivo) => {
    setFestivos(f => [...f.filter(x => x.fecha !== festivo.fecha), festivo])
  }, [])

  const eliminarFestivo = useCallback((fecha) => {
    const fes = festivosRef.current.find(x => x.fecha === fecha)
    setFestivos(f => f.filter(x => x.fecha !== fecha))
    return () => { if (fes) setFestivos(f => f.some(x => x.fecha === fecha) ? f : [...f, fes]) }
  }, [])

  const esFestivo = useCallback((iso) => festivos.find(f => f.fecha === iso) || null, [festivos])

  // ---- Backup ----
  // "extra" (backups version 2+) trae también festivos y plantillas de WhatsApp.
  const restaurarBackup = useCallback((nuevaData, extra) => {
    cambiar(() => migrarDatos({ alumnos: [], sesiones: [], pagos: [], tareas: {}, eventos: {}, ...nuevaData }))
    if (extra) {
      if (Array.isArray(extra.festivos)) setFestivos(extra.festivos)
      restaurarPlantillas(extra)
    }
  }, [cambiar])

  // ---- Tareas pendientes y eventos próximos (por alumno) ----
  // Misma mecánica para ambos: cada alumno acumula una lista de elementos
  // { id, tarea, evento, fecha, completada } (título, descripción, fecha).
  // "coleccion" es 'tareas' o 'eventos'.
  const guardarItem = useCallback((coleccion, alumnoId, { tarea, evento, fecha }) => {
    cambiar(d => {
      const actuales = (d[coleccion] && d[coleccion][alumnoId]) || []
      const nuevo = { id: nuevoId(), tarea, evento, fecha: fecha || todayStr(), completada: false }
      return { ...d, [coleccion]: { ...(d[coleccion] || {}), [alumnoId]: [...actuales, nuevo] } }
    })
  }, [cambiar])

  const eliminarItem = useCallback((coleccion, alumnoId, itemId) => {
    const lista = (dataRef.current[coleccion] && dataRef.current[coleccion][alumnoId]) || []
    const idx = lista.findIndex(t => t.id === itemId)
    if (idx === -1) return () => {}
    const item = lista[idx]
    cambiar(d => {
      const actuales = (d[coleccion] && d[coleccion][alumnoId]) || []
      return { ...d, [coleccion]: { ...(d[coleccion] || {}), [alumnoId]: actuales.filter(t => t.id !== itemId) } }
    })
    return () => cambiar(d => {
      const actuales = ((d[coleccion] && d[coleccion][alumnoId]) || []).slice()
      if (actuales.some(t => t.id === itemId)) return d
      actuales.splice(Math.min(idx, actuales.length), 0, item)
      return { ...d, [coleccion]: { ...(d[coleccion] || {}), [alumnoId]: actuales } }
    })
  }, [cambiar])

  // Marca/desmarca un elemento como realizado sin eliminarlo de la lista.
  const marcarItem = useCallback((coleccion, alumnoId, itemId, completada) => {
    cambiar(d => {
      const actuales = (d[coleccion] && d[coleccion][alumnoId]) || []
      return { ...d, [coleccion]: { ...(d[coleccion] || {}), [alumnoId]: actuales.map(t => t.id === itemId ? { ...t, completada } : t) } }
    })
  }, [cambiar])

  const guardarTarea = useCallback((alumnoId, item) => guardarItem('tareas', alumnoId, item), [guardarItem])
  const eliminarTarea = useCallback((alumnoId, id) => eliminarItem('tareas', alumnoId, id), [eliminarItem])
  const marcarTarea = useCallback((alumnoId, id, c) => marcarItem('tareas', alumnoId, id, c), [marcarItem])
  const guardarEvento = useCallback((alumnoId, item) => guardarItem('eventos', alumnoId, item), [guardarItem])
  const eliminarEvento = useCallback((alumnoId, id) => eliminarItem('eventos', alumnoId, id), [eliminarItem])
  const marcarEvento = useCallback((alumnoId, id, c) => marcarItem('eventos', alumnoId, id, c), [marcarItem])

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
    marcarPagoCobrado,
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
