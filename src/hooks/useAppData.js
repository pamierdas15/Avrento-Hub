import { useState, useEffect, useCallback } from 'react'
import { SK, FES_SK } from '../utils/constants'

function loadData() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SK))
    return parsed || { alumnos: [], sesiones: [], pagos: [] }
  } catch {
    return { alumnos: [], sesiones: [], pagos: [] }
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
    setData(d => ({
      alumnos: d.alumnos.filter(a => a.id !== id),
      sesiones: d.sesiones.filter(s => s.alumnoId !== id),
      pagos: d.pagos.filter(p => p.alumnoId !== id)
    }))
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
  const restaurarBackup = useCallback((nuevaData) => {
    setData(nuevaData)
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
    restaurarBackup
  }
}
