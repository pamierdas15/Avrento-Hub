import { useState } from 'react'
import { DIAS_ES, MESES, FEST_CFG } from '../utils/constants'
import { getWeekDates, todayStr } from '../utils/helpers'

// Calendario semanal en formato "hero": siempre visible dentro de Asistencia,
// muestra los alumnos asignados a cada día de la semana (igual que la antigua
// pestaña Calendario), pero de solo lectura — no abre modales ni depende del
// formulario de registro de asistencia que tiene encima.
export default function CalendarioHero({ data, esFestivo }) {
  const [offset, setOffset] = useState(0)
  const dates = getWeekDates(offset)
  const todayISO = todayStr()
  const alumnos = data.alumnos || []
  const m1 = dates[0], m7 = dates[6]
  const label = `${m1.getDate()} ${MESES[m1.getMonth()].substring(0, 3)} — ${m7.getDate()} ${MESES[m7.getMonth()].substring(0, 3)} ${m7.getFullYear()}`

  const dayMap = {}
  dates.forEach(d => { dayMap[d.getDay()] = [] })
  alumnos.forEach((a, idx) => {
    ;(a.dias || (a.dia ? [a.dia] : [])).forEach(ds => {
      const dn = parseInt(ds)
      if (dayMap[dn] !== undefined) dayMap[dn].push({ ...a, colorIdx: idx })
    })
  })

  return (
    <div className="cal-hero">
      <div className="cal-hero-header">
        <button className="cal-nav" onClick={() => setOffset(o => o - 1)} type="button">‹</button>
        <span className="cal-hero-title" style={{ textTransform: 'none' }}>{label}</span>
        <button className="cal-nav" onClick={() => setOffset(o => o + 1)} type="button">›</button>
      </div>

      <div className="cal-hero-dias">
        {dates.map((d, i) => {
          const iso = d.toISOString().slice(0, 10)
          const isT = iso === todayISO
          return (
            <div className={'cal-hero-dia-hdr' + (isT ? ' today-col' : '')} key={i}>
              {isT ? <div className="cal-today-dot"></div> : null}
              <div>{DIAS_ES[d.getDay()]}</div>
              <div style={{ fontSize: 11, fontWeight: isT ? 700 : 400, color: isT ? '#4d9fff' : 'rgba(255,255,255,0.35)' }}>{d.getDate()}</div>
            </div>
          )
        })}
      </div>

      {!alumnos.length ? (
        <p className="cal-empty-msg">Añade alumnos con día y hora para ver el calendario.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3 }}>
          {dates.map((d, i) => {
            const eventos = dayMap[d.getDay()] || []
            const iso = d.toISOString().slice(0, 10)
            const isT = iso === todayISO
            const fes = esFestivo ? esFestivo(iso) : null
            if (fes) {
              const fc = FEST_CFG[fes.tipo]
              return (
                <div key={i} className="cal-hero-slot" style={{ background: fc.bg, border: '1px solid ' + fc.border, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ textAlign: 'center', padding: '4px 0' }}>
                    <div style={{ fontSize: 16 }}>{fc.ico}</div>
                    <div style={{ fontSize: 8, color: fc.color, fontWeight: 700, textTransform: 'uppercase', marginTop: 2 }}>{fes.tipo.substring(0, 3)}</div>
                  </div>
                </div>
              )
            }
            return (
              <div key={i} className="cal-hero-slot" style={isT ? { background: 'rgba(37,99,235,0.08)', borderRadius: 8 } : undefined}>
                {['17:00', '18:30'].map(turno => {
                  const tc = turno === '17:00' ? { bg: 'rgba(77,159,255,0.12)', border: '#4d9fff', text: '#4d9fff' } : { bg: 'rgba(251,146,60,0.12)', border: '#fb923c', text: '#fb923c' }
                  const arr = eventos.filter(a => a.hora === turno)
                  if (!arr.length) {
                    return <div key={turno} style={{ minHeight: 22, borderRadius: 6, background: tc.bg, marginBottom: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 9, color: tc.border + '55' }}>{turno}</span></div>
                  }
                  return arr.map(a => (
                    <div className="cal-hero-event" key={a.id + turno} style={{ background: tc.bg, borderLeft: '2px solid ' + tc.border, marginBottom: 3 }}>
                      <div className="ev-name" style={{ color: tc.text }}>{a.nombre.split(' ')[0]}</div>
                      <div className="ev-hora" style={{ color: tc.text }}>{turno}</div>
                    </div>
                  ))
                })}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
