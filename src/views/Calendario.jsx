import { useState } from 'react'
import ScreenHeader from '../components/ScreenHeader.jsx'
import { DIAS_ES, MESES, FEST_CFG } from '../utils/constants'
import { getWeekDates, todayStr } from '../utils/helpers'

export default function Calendario({ data, esFestivo, onVerEvento, onVerFestivo, onAbrirFestivo }) {
  const [offset, setOffset] = useState(0)
  const dates = getWeekDates(offset)
  const todayISO = todayStr()
  const { alumnos } = data
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
    <>
      <div className="section-pad" style={{ paddingBottom: 0 }}>
        <ScreenHeader title="Calendario" />
      </div>
      <div className="cal-header">
        <button className="cal-nav" onClick={() => setOffset(o => o - 1)}>‹</button>
        <span className="cal-week-label">{label}</span>
        <button className="cal-nav" onClick={() => setOffset(o => o + 1)}>›</button>
        <button onClick={onAbrirFestivo} style={{ padding: '5px 10px', borderRadius: 10, border: '1px solid rgba(251,191,36,0.3)', background: 'rgba(251,191,36,0.08)', color: '#fbbf24', fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>+ Festivo</button>
      </div>

      <div className="cal-days">
        {dates.map((d, i) => {
          const iso = d.toISOString().slice(0, 10)
          const isT = iso === todayISO
          return (
            <div className={'cal-day-hdr' + (isT ? ' today-col' : '')} key={i}>
              {isT ? <div className="cal-today-dot"></div> : null}
              <div>{DIAS_ES[d.getDay()]}</div>
              <div style={{ fontSize: 11, fontWeight: isT ? 700 : 400, color: isT ? '#4d9fff' : 'rgba(255,255,255,0.35)' }}>{d.getDate()}</div>
            </div>
          )
        })}
      </div>

      <div className="cal-grid">
        {!alumnos.length ? (
          <p className="cal-empty-msg">Añade alumnos con día y hora para ver el calendario.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3 }}>
            {dates.map((d, i) => {
              const eventos = dayMap[d.getDay()] || []
              const iso = d.toISOString().slice(0, 10)
              const isT = iso === todayISO
              const fes = esFestivo(iso)
              if (fes) {
                const fc = FEST_CFG[fes.tipo]
                return (
                  <div key={i} className="cal-slot" style={{ background: fc.bg, border: '1px solid ' + fc.border, borderRadius: 8, cursor: 'pointer', alignItems: 'center', justifyContent: 'center' }} onClick={() => onVerFestivo(iso)}>
                    <div style={{ textAlign: 'center', padding: '4px 0' }}>
                      <div style={{ fontSize: 16 }}>{fc.ico}</div>
                      <div style={{ fontSize: 8, color: fc.color, fontWeight: 700, textTransform: 'uppercase', marginTop: 2 }}>{fes.tipo.substring(0, 3)}</div>
                    </div>
                  </div>
                )
              }
              return (
                <div key={i} className="cal-slot" style={isT ? { background: 'rgba(37,99,235,0.08)', borderRadius: 8 } : undefined}>
                  {['17:00', '18:30'].map(turno => {
                    const tc = turno === '17:00' ? { bg: 'rgba(77,159,255,0.12)', border: '#4d9fff', text: '#4d9fff' } : { bg: 'rgba(251,146,60,0.12)', border: '#fb923c', text: '#fb923c' }
                    const arr = eventos.filter(a => a.hora === turno)
                    if (!arr.length) {
                      return <div key={turno} style={{ minHeight: 22, borderRadius: 6, background: tc.bg, marginBottom: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 9, color: tc.border + '55' }}>{turno}</span></div>
                    }
                    return arr.map(a => (
                      <div className="cal-event" key={a.id + turno} style={{ background: tc.bg, borderLeft: '2px solid ' + tc.border, marginBottom: 3 }} onClick={() => onVerEvento(a.id, iso)}>
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
    </>
  )
}
