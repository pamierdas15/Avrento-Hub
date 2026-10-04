import { COLORS, TURNOS } from './constants'

// ---- Turnos de clase ----
// Un alumno puede tener uno de los turnos fijos (hora = '11:00' o '17:00', sin
// horaFin) o un horario personalizado (hora = inicio y horaFin = fin, p. ej.
// '16:00' y '17:30').
export const esTurnoPersonalizado = a => !!(a && a.hora && a.horaFin)

// Texto del turno: "Tarde · 17–18:30" para los fijos, "16:00–17:30" para los personalizados.
export function etiquetaTurno(a) {
  if (!a || !a.hora) return ''
  if (!esTurnoPersonalizado(a) && TURNOS[a.hora]) return TURNOS[a.hora]
  return a.horaFin ? `${a.hora}–${a.horaFin}` : a.hora
}

// Clase de color del turno: t1 (tarde, azul), t2 (mañana, naranja),
// tx (personalizado, morado) o sin.
export function claseTurno(a) {
  if (!a || !a.hora) return 'sin'
  if (esTurnoPersonalizado(a)) return 'tx'
  return a.hora === '17:00' ? 't1' : a.hora === '11:00' ? 't2' : 'tx'
}

// Fecha en formato AAAA-MM-DD según la hora LOCAL del dispositivo.
// (toISOString() usa UTC: en España, entre las 00:00 y las 02:00, devolvía
// todavía el día anterior y descuadraba asistencia, pagos y el "hoy".)
export const isoLocal = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export const todayStr = () => isoLocal()

export const fmt = n => (+n).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'

export const initials = n => n.trim().split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()

export const alumnoColor = idx => COLORS[idx % COLORS.length]

export function getWeekDates(off) {
  const now = new Date()
  const day = now.getDay()
  const mon = new Date(now)
  mon.setDate(now.getDate() - ((day === 0 ? 7 : day) - 1) + (off * 7))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mon)
    d.setDate(mon.getDate() + i)
    return d
  })
}
