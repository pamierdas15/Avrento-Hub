import { useState } from 'react'
import { MESES } from '../utils/constants'

const DIAS_MIN = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

// Calendario puramente visual: no depende de alumnos, sesiones, pagos ni
// festivos de la app. Solo muestra el mes actual (navegable) con el día
// de hoy resaltado.
export default function CalendarioHero() {
  const hoy = new Date()
  const [viewDate, setViewDate] = useState(new Date(hoy.getFullYear(), hoy.getMonth(), 1))

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const first = new Date(year, month, 1)
  const startOffset = (first.getDay() + 6) % 7 // lunes = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  function cambiarMes(dir) {
    setViewDate(v => new Date(v.getFullYear(), v.getMonth() + dir, 1))
  }

  function irAHoy() {
    setViewDate(new Date(hoy.getFullYear(), hoy.getMonth(), 1))
  }

  const esMesActual = hoy.getFullYear() === year && hoy.getMonth() === month

  return (
    <div className="cal-hero">
      <div className="cal-hero-header">
        <button className="cal-nav" onClick={() => cambiarMes(-1)} type="button">‹</button>
        <span className="cal-hero-title" onClick={irAHoy}>{MESES[month]} {year}</span>
        <button className="cal-nav" onClick={() => cambiarMes(1)} type="button">›</button>
      </div>
      <div className="cal-hero-grid cal-hero-dow">
        {DIAS_MIN.map((d, i) => <div key={i}>{d}</div>)}
      </div>
      <div className="cal-hero-grid">
        {cells.map((d, i) => {
          const esHoy = esMesActual && d === hoy.getDate()
          return (
            <div key={i} className={'cal-hero-cell' + (esHoy ? ' cal-hero-today' : '') + (d ? '' : ' cal-hero-empty')}>
              {d || ''}
            </div>
          )
        })}
      </div>
    </div>
  )
}
