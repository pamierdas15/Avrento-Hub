import { useState } from 'react'
import { DIAS_ES, MESES, FEST_CFG } from '../utils/constants'
import { getWeekDates, todayStr, isoLocal, esTurnoPersonalizado } from '../utils/helpers'

// Calendario semanal en formato "hero": siempre visible dentro de Asistencia,
// muestra los alumnos asignados a cada día de la semana (igual que la antigua
// pestaña Calendario), pero de solo lectura — no abre modales ni depende del
// formulario de registro de asistencia que tiene encima.
// Filas de un día: los dos turnos fijos (siempre, aunque estén vacíos) y, si
// hay alumnos con horario personalizado ese día, una fila por cada hora de
// inicio. Todo ordenado por hora.
function filasDelDia(alumnosDia) {
  const filas = [
    { key: '11:00', hora: '11:00', t: 't2', alumnos: alumnosDia.filter(a => a.hora === '11:00' && !esTurnoPersonalizado(a)) },
    { key: '17:00', hora: '17:00', t: 't1', alumnos: alumnosDia.filter(a => a.hora === '17:00' && !esTurnoPersonalizado(a)) }
  ]
  const personalizados = alumnosDia.filter(a => esTurnoPersonalizado(a) || (a.hora && a.hora !== '11:00' && a.hora !== '17:00'))
  const horas = [...new Set(personalizados.map(a => a.hora))]
  horas.forEach(h => filas.push({ key: 'p-' + h, hora: h, t: 'tx', alumnos: personalizados.filter(a => a.hora === h) }))
  return filas.sort((x, y) => x.hora.localeCompare(y.hora))
}

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
        <span className="cal-hero-title txt-normal">{label}</span>
        <button className="cal-nav" onClick={() => setOffset(o => o + 1)} type="button">›</button>
      </div>

      <div className="cal-hero-dias">
        {dates.map((d, i) => {
          const iso = isoLocal(d)
          const isT = iso === todayISO
          return (
            <div className={'cal-hero-dia-hdr' + (isT ? ' today-col' : '')} key={i}>
              {isT ? <div className="cal-today-dot"></div> : null}
              <div>{DIAS_ES[d.getDay()]}</div>
              <div className="cal-hero-num">{d.getDate()}</div>
            </div>
          )
        })}
      </div>

      {!alumnos.length ? (
        <p className="cal-empty-msg">Añade alumnos con día y hora para ver el calendario.</p>
      ) : (
        <div className="cal-hero-grid">
          {dates.map((d, i) => {
            const eventos = dayMap[d.getDay()] || []
            const iso = isoLocal(d)
            const isT = iso === todayISO
            const fes = esFestivo ? esFestivo(iso) : null
            if (fes) {
              const fc = FEST_CFG[fes.tipo]
              return (
                <div key={i} className="cal-hero-slot fes-slot" style={{ background: fc.bg, border: '1px solid ' + fc.border }}>
                  <div className="fes-slot-inner">
                    <div className="fes-slot-ico">{fc.ico}</div>
                    <div className="fes-slot-txt" style={{ color: fc.color }}>{fes.tipo.substring(0, 3)}</div>
                  </div>
                </div>
              )
            }
            return (
              <div key={i} className={'cal-hero-slot' + (isT ? ' is-hoy' : '')}>
                {filasDelDia(eventos).map(fila => {
                  if (!fila.alumnos.length) {
                    return <div key={fila.key} className={'turno-vacio ' + fila.t}><span>{fila.hora}</span></div>
                  }
                  return fila.alumnos.map(a => (
                    <div className={'cal-hero-event ' + fila.t} key={a.id + fila.key}>
                      <div className="ev-name">{a.nombre.split(' ')[0]}</div>
                      <div className="ev-hora">{a.hora}</div>
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
