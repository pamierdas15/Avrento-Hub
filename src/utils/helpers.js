import { COLORS } from './constants'

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
