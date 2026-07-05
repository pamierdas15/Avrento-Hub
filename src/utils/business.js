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

function capitaliza(s) { return s.charAt(0).toUpperCase() + s.slice(1) }

// ---- Periodos pendientes por modalidad (fuente única de verdad) ----

function pendientesMensuales(d, alumno) {
  const hoy = new Date()
  const inicio = alumno.alta ? new Date(alumno.alta + 'T12:00:00') : hoy
  let y = inicio.getFullYear(), m = inicio.getMonth()
  const limitY = hoy.getFullYear(), limitM = hoy.getMonth()
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
        const periodo = `${capitaliza(MESES[m])} ${y}`
        out.push({
          value: `${y}-${String(m + 1).padStart(2, '0')}`,
          label: `${periodo} · ${fmt(alumno.tarifa)}`,
          importe: alumno.tarifa,
          periodo,
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
      const periodo = `la semana del ${cursor.getDate()} al ${domingo.getDate()} de ${MESES[domingo.getMonth()]}`
      out.push({
        value: cursor.toISOString().slice(0, 10),
        label: `${cursor.getDate()} ${MESES[cursor.getMonth()].substring(0, 3)} — ${domingo.getDate()} ${MESES[domingo.getMonth()].substring(0, 3)} · ${fmt(alumno.precioSemana)}`,
        importe: alumno.precioSemana,
        periodo,
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

// Lista de periodos pendientes de cobro para un alumno, según su modalidad de pago.
// Cada elemento sirve para rellenar el formulario de "Registrar pago" con un clic.
export function getPendientesDetalle(d, alumno) {
  if (!alumno) return []
  if (alumno.modalidad === 'fija') return pendientesMensuales(d, alumno)
  if (alumno.modalidad === 'semana') return pendientesSemanales(d, alumno)
  return pendientesSesiones(d, alumno)
}

// Resumen único de lo pendiente de un alumno: nº de periodos, importe total,
// y texto legible de a qué corresponde (usado en alertas y en WhatsApp)
export function getResumenPendiente(d, alumno) {
  if (!alumno) return { count: 0, importe: 0, texto: '' }
  if (alumno.modalidad === 'fija') {
    const items = pendientesMensuales(d, alumno)
    const importe = items.reduce((s, it) => s + it.importe, 0)
    const texto = items.map(it => it.periodo).join(' y ')
    return { count: items.length, importe, texto }
  }
  if (alumno.modalidad === 'semana') {
    const items = pendientesSemanales(d, alumno)
    const importe = items.reduce((s, it) => s + it.importe, 0)
    const texto = items.map(it => it.periodo).join(' y ')
    return { count: items.length, importe, texto }
  }
  const items = pendientesSesiones(d, alumno)
  const pend = items.length
  const importe = pend * (alumno.precioSesion || 0)
  const texto = pend > 0 ? `${pend} sesión${pend > 1 ? 'es' : ''} pendiente${pend > 1 ? 's' : ''}` : ''
  return { count: pend, importe, texto }
}

// Alumnos con algún pago pendiente (misma fuente que la pestaña Pagos).
// Cada alerta es simplemente: nombre del alumno + número de pagos pendientes.
export function getAlertas(d) {
  const res = []
  d.alumnos.forEach(a => {
    if (a.estado === 'baja') return
    const resumen = getResumenPendiente(d, a)
    if (resumen.count > 0) res.push({ nombre: a.nombre, count: resumen.count })
  })
  return res
}

// Importe pendiente formateado para un alumno concreto (usado en la info de pago)
export function getPendienteFmt(d, alumnoId) {
  const a = d.alumnos.find(x => x.id === alumnoId)
  if (!a) return '0,00 €'
  return fmt(getResumenPendiente(d, a).importe)
}
