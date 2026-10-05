import { useState } from 'react'
import { DIAS_ES, MESES, FEST_CFG } from '../utils/constants'
import { getWeekDates, todayStr, isoLocal } from '../utils/helpers'
import { clasesDelDia, agruparPorTurno } from '../utils/business'

// Calendario semanal dentro de Asistencia. Muestra, para cada día, las clases
// reales de esa fecha (horario fijo + clases puntuales, sin las canceladas)
// agrupadas por turno, y las plazas libres de cada turno. Al tocar un día se
// abre la ventana para gestionar sus clases (añadir, mover, cancelar).
const color = clave => clave === '11:00' ? 't2' : clave === '17:00' ? 't1' : 'tx'

export default function CalendarioHero({ data, esFestivo, onAbrirDia }) {
  const [offset, setOffset] = useState(0)
  const dates = getWeekDates(offset)
  const todayISO = todayStr()
  const alumnos = data.alumnos || []
  const m1 = dates[0], m7 = dates[6]
  const label = `${m1.getDate()} ${MESES[m1.getMonth()].substring(0, 3)} — ${m7.getDate()} ${MESES[m7.getMonth()].substring(0, 3)} ${m7.getFullYear()}`

  const abrir = iso => { if (onAbrirDia) onAbrirDia(iso) }

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
            <div className={'cal-hero-dia-hdr' + (isT ? ' today-col' : '')} key={i} onClick={() => abrir(iso)}>
              {isT ? <div className="cal-today-dot"></div> : null}
              <div>{DIAS_ES[d.getDay()]}</div>
              <div className="cal-hero-num">{d.getDate()}</div>
            </div>
          )
        })}
      </div>

      {!alumnos.length ? (
        <p className="cal-empty-msg">Añade alumnos para ver el calendario.</p>
      ) : (
        <div className="cal-hero-grid">
          {dates.map((d, i) => {
            const iso = isoLocal(d)
            const isT = iso === todayISO
            const fes = esFestivo ? esFestivo(iso) : null
            if (fes) {
              const fc = FEST_CFG[fes.tipo]
              return (
                <div key={i} className="cal-hero-slot fes-slot" style={{ background: fc.bg, border: '1px solid ' + fc.border }} onClick={() => abrir(iso)}>
                  <div className="fes-slot-inner">
                    <div className="fes-slot-ico">{fc.ico}</div>
                    <div className="fes-slot-txt" style={{ color: fc.color }}>{fes.tipo.substring(0, 3)}</div>
                  </div>
                </div>
              )
            }
            return (
              <div key={i} className={'cal-hero-slot' + (isT ? ' is-hoy' : '')} onClick={() => abrir(iso)}>
                {agruparPorTurno(clasesDelDia(data, iso).filter(c => !c.cancelada && c.hora), true).map(g => {
                  const t = color(g.clave)
                  const libres = g.plazas - g.ocupadas
                  if (!g.clases.length) {
                    return (
                      <div key={g.clave} className={'turno-vacio ' + t}>
                        <span>{g.hora}</span>
                        <span className="turno-libres">{g.plazas} libres</span>
                      </div>
                    )
                  }
                  return (
                    <div key={g.clave}>
                      {g.clases.map(c => (
                        <div className={'cal-hero-event ' + t + (c.puntual ? ' puntual' : '')} key={c.key}>
                          <div className="ev-name">{c.alumno.nombre.split(' ')[0]}</div>
                          <div className="ev-hora">{c.hora}</div>
                        </div>
                      ))}
                      <div className={'turno-cupo' + (libres <= 0 ? ' lleno' : '')}>
                        {libres > 0 ? `${libres} libre${libres > 1 ? 's' : ''}` : libres === 0 ? 'Completo' : 'Sobrecupo'}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      )}
      <div className="cal-hero-ayuda">Toca un día para añadir, mover o cancelar clases</div>
    </div>
  )
}
