import { COLORS } from './constants'

export const todayStr = () => new Date().toISOString().slice(0, 10)

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
