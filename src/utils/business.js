import { fmt, todayStr } from './helpers'
import { MESES } from './constants'

function inicioSemana(d) {
  const dd = new Date(d)
  const dow = dd.getDay()
  dd.setDate(dd.getDate() - ((dow === 0 ? 7 : dow) - 1))
  dd.setHours(0, 0, 0, 0)
  return dd
}

function pagoEnRango(pagos, alumnoId, desde, hasta) {
  return pagos.some(p => {
    if (p.alumnoId !== alumnoId || p.tipo !== 'recibido') return false
    const f = new Date(p.fecha + 'T12:00:00')
    return f >= desde && f <= hasta
  })
}

// Sesiones "presente" cuya fecha ya ha pasado (no cuentan las de hoy ni futuras)
function sesionesPasadas(d, alumnoId) {
  const hoyISO = todayStr()
  return d.sesiones.filter(s => s.alumnoId === alumnoId && s.estado === 'presente' && s.fecha < hoyISO)
}

// Alumnos con pagos pendientes:
// - Mensual: no cobrada, y ya se ha superado el día 15 del mes en curso
// - Semanal: la semana debe estar completa y ya pasada (no la semana actual)
// - Sesión: solo cuentan sesiones cuya fecha ya ha pasado
export function getAlertas(d) {
  const hoy = new Date()
  const dia = hoy.getDate(), mes = hoy.getMonth(), anyo = hoy.getFullYear()
  const res = []
  d.alumnos.forEach(a => {
    if (a.estado === 'baja') return
    if (a.modalidad === 'fija') {
      if (dia <= 15) return
      const ok = d.pagos.some(p => {
        const f = new Date(p.fecha + 'T12:00:00')
        return p.alumnoId === a.id && p.tipo === 'recibido' && f.getMonth() === mes && f.getFullYear() === anyo
      })
      if (!ok) res.push({ tipo: 'mensual', nombre: a.nombre, tarifa: a.tarifa })
    } else if (a.modalidad === 'semana') {
      const hoyLunes = inicioSemana(hoy)
      const lunesAnterior = new Date(hoyLunes); lunesAnterior.setDate(hoyLunes.getDate() - 7)
      const domingoAnterior = new Date(lunesAnterior); domingoAnterior.setDate(lunesAnterior.getDate() + 6); domingoAnterior.setHours(23, 59, 59, 999)
      const ok = pagoEnRango(d.pagos, a.id, lunesAnterior, domingoAnterior)
      if (!ok) res.push({ tipo: 'semanal', nombre: a.nombre, tarifa: a.precioSemana })
    } else {
      const ses = sesionesPasadas(d, a.id).length
      const total = d.pagos.filter(p => p.alumnoId === a.id && p.tipo === 'recibido').reduce((s, p) => s + p.importe, 0)
      const pag = a.precioSesion > 0 ? Math.floor(total / a.precioSesion) : 0
      const pend = ses - pag
      if (pend > 0) res.push({ tipo: 'sesion', nombre: a.nombre, pendientes: pend, precioSesion: a.precioSesion || 0 })
    }
  })
  return res
}

// Importe pendiente formateado para un alumno concreto (usado en WhatsApp / info de pago)
export function getPendienteFmt(d, alumnoId) {
  const a = d.alumnos.find(x => x.id === alumnoId)
  if (!a) return '0,00 €'
  const hoy = new Date()
  if (a.modalidad === 'fija') {
    if (hoy.getDate() <= 15) return '0,00 €'
    const mes = hoy.getMonth(), anyo = hoy.getFullYear()
    const ok = d.pagos.some(p => {
      const f = new Date(p.fecha + 'T12:00:00')
      return p.alumnoId === alumnoId && p.tipo === 'recibido' && f.getMonth() === mes && f.getFullYear() === anyo
    })
    return ok ? '0,00 €' : fmt(a.tarifa)
  }
  if (a.modalidad === 'semana') {
    const hoyLunes = inicioSemana(hoy)
    const lunesAnterior = new Date(hoyLunes); lunesAnterior.setDate(hoyLunes.getDate() - 7)
    const domingoAnterior = new Date(lunesAnterior); domingoAnterior.setDate(lunesAnterior.getDate() + 6); domingoAnterior.setHours(23, 59, 59, 999)
    const ok = pagoEnRango(d.pagos, alumnoId, lunesAnterior, domingoAnterior)
    return ok ? '0,00 €' : fmt(a.precioSemana)
  }
  const ses = sesionesPasadas(d, alumnoId).length
  const total = d.pagos.filter(p => p.alumnoId === alumnoId && p.tipo === 'recibido').reduce((s, p) => s + p.importe, 0)
  const pag = a.precioSesion > 0 ? Math.floor(total / a.precioSesion) : 0
  const pend = ses - pag
  return pend > 0 ? fmt(pend * a.precioSesion) : '0,00 €'
}

// Lista de periodos pendientes de cobro para un alumno, según su modalidad de pago.
// Cada elemento sirve para rellenar el formulario de "Registrar pago" con un clic.
export function getPendientesDetalle(d, alumno) {
  if (!alumno) return []
  if (alumno.modalidad === 'fija') return pendientesMensuales(d, alumno)
  if (alumno.modalidad === 'semana') return pendientesSemanales(d, alumno)
  return pendientesSesiones(d, alumno)
}

function capitaliza(s) { return s.charAt(0).toUpperCase() + s.slice(1) }

function pendientesMensuales(d, alumno) {
  const hoy = new Date()
  const inicio = alumno.alta ? new Date(alumno.alta + 'T12:00:00') : hoy
  let y = inicio.getFullYear(), m = inicio.getMonth()
  const limitY = hoy.getFullYear(), limitM = hoy.getMonth()
  // El mes en curso solo cuenta como pendiente a partir del día 16
  const incluyeMesActual = hoy.getDate() > 15
  const out = []
  let guard = 0
  while ((y < limitY || (y === limitY && m <= limitM)) && guard < 24) {
    const esMesActual = y === limitY && m === limitM
    if (!esMesActual || incluyeMesActual) {
      const ok = d.pagos.some(p => {
        if (p.alumnoId !== alumno.id || p.tipo !== 'recibido') return false
        const f = new Date(p.fecha + 'T12:00:00')
        return f.getFullYear() === y && f.getMonth() === m
      })
      if (!ok) {
        out.push({
          value: `${y}-${String(m + 1).padStart(2, '0')}`,
          label: `${capitaliza(MESES[m])} ${y} · ${fmt(alumno.tarifa)}`,
          importe: alumno.tarifa,
          concepto: `Mensualidad de ${MESES[m]} ${y}`
        })
      }
    }
    m++; if (m > 11) { m = 0; y++ }
    guard++
  }
  return out
}

function pendientesSemanales(d, alumno) {
  const hoy = new Date()
  const hoyLunes = inicioSemana(hoy)
  // Solo cuentan semanas ya completas y pasadas (no la semana en curso)
  const ultimoLunes = new Date(hoyLunes); ultimoLunes.setDate(hoyLunes.getDate() - 7)
  let inicio = alumno.alta ? inicioSemana(new Date(alumno.alta + 'T12:00:00')) : ultimoLunes
  const maxLookbackMs = 12 * 7 * 24 * 60 * 60 * 1000
  if (ultimoLunes - inicio > maxLookbackMs) inicio = new Date(ultimoLunes.getTime() - maxLookbackMs)
  const out = []
  let cursor = new Date(inicio)
  let guard = 0
  while (cursor <= ultimoLunes && guard < 20) {
    const domingo = new Date(cursor); domingo.setDate(cursor.getDate() + 6); domingo.setHours(23, 59, 59, 999)
    const ok = pagoEnRango(d.pagos, alumno.id, cursor, domingo)
    if (!ok) {
      out.push({
        value: cursor.toISOString().slice(0, 10),
        label: `${cursor.getDate()} ${MESES[cursor.getMonth()].substring(0, 3)} — ${domingo.getDate()} ${MESES[domingo.getMonth()].substring(0, 3)} · ${fmt(alumno.precioSemana)}`,
        importe: alumno.precioSemana,
        concepto: `Semana del ${cursor.getDate()} al ${domingo.getDate()} de ${MESES[domingo.getMonth()]}`
      })
    }
    cursor = new Date(cursor); cursor.setDate(cursor.getDate() + 7)
    guard++
  }
  return out
}

function pendientesSesiones(d, alumno) {
  const ses = sesionesPasadas(d, alumno.id).length
  const total = d.pagos.filter(p => p.alumnoId === alumno.id && p.tipo === 'recibido').reduce((s, p) => s + p.importe, 0)
  const pag = alumno.precioSesion > 0 ? Math.floor(total / alumno.precioSesion) : 0
  const pend = ses - pag
  if (pend <= 0) return []
  const out = []
  for (let n = 1; n <= pend; n++) {
    out.push({
      value: String(n),
      label: `${n} sesión${n > 1 ? 'es' : ''} pendiente${n > 1 ? 's' : ''} · ${fmt(n * alumno.precioSesion)}`,
      importe: n * alumno.precioSesion,
      concepto: `${n} sesión${n > 1 ? 'es' : ''} pendiente${n > 1 ? 's' : ''}`
    })
  }
  return out
}
