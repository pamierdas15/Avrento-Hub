import { useState, useRef } from 'react'
import { DIAS_ES, MESES, TURNOS, FEST_CFG } from '../utils/constants'
import { todayStr, isoLocal, initials, alumnoColor, getWeekDates } from '../utils/helpers'
import { getAlertas } from '../utils/business'
import TareaPendienteHero from '../components/TareaPendienteHero.jsx'
import EventoProximoHero from '../components/EventoProximoHero.jsx'

export default function Inicio({ data, esFestivo, registrarSesion, guardarTarea, guardarEvento, showToast, onGoTab, onIrAPago, onNuevoAlumno, onVerAlertas }) {
  const hoy = new Date()
  const hoyISO = todayStr()
  const dsHoy = hoy.getDay()
  const alertas = getAlertas(data)

  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedIdx, setSelectedIdx] = useState(dsHoy === 0 ? 6 : dsHoy - 1)
  const [expandedId, setExpandedId] = useState(null)
  const touchX = useRef(null)

  const sem = getWeekDates(weekOffset)
  const selDate = sem[selectedIdx]
  const selISO = isoLocal(selDate)
  const selDow = selDate.getDay()
  const esSelHoy = selISO === hoyISO
  const nombreDiaSel = esSelHoy ? 'Hoy' : selDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
  const fesSel = esFestivo(selISO)

  const clasesDia = data.alumnos
    .filter(a => (a.dias || []).includes(String(selDow)))
    .sort((a, b) => (a.hora || '').localeCompare(b.hora || ''))

  const m1 = sem[0], m7 = sem[6]
  const weekLabel = `${m1.getDate()} ${MESES[m1.getMonth()].substring(0, 3)} — ${m7.getDate()} ${MESES[m7.getMonth()].substring(0, 3)}`

  function cambiarSemana(dir) {
    setWeekOffset(o => o + dir)
  }

  function irAHoy() {
    setWeekOffset(0)
    setSelectedIdx(dsHoy === 0 ? 6 : dsHoy - 1)
  }

  function onTouchStart(e) { touchX.current = e.touches[0].clientX }
  function onTouchEnd(e) {
    if (touchX.current == null) return
    const dx = e.changedTouches[0].clientX - touchX.current
    if (Math.abs(dx) > 40) cambiarSemana(dx < 0 ? 1 : -1)
    touchX.current = null
  }

  function regDesdeInicio(alumnoId) {
    const ok = registrarSesion(alumnoId, selISO, 'presente')
    showToast(ok ? 'Asistencia registrada' : 'Ya existe un registro para esta fecha')
  }

  return (
    <div className="section-pad">
      <div className="quick-grid">
        <button className="quick-btn" onClick={onNuevoAlumno}>
          <div className="qico qico-azul">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4d9fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
          </div>
          <span className="quick-label">Nuevo alumno</span>
        </button>
        <button className="quick-btn" onClick={() => onGoTab('asistencia')}>
          <div className="qico qico-verde">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          </div>
          <span className="quick-label">Reg. clase</span>
        </button>
        <button className="quick-btn" onClick={() => onGoTab('pagos')}>
          <div className="qico qico-morado">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
          </div>
          <span className="quick-label">Reg. pago</span>
        </button>
      </div>

      {alertas.length ? (
        <div className="alerta-box" onClick={onVerAlertas}>
          <div className="alerta-box-title">⚠ {alertas.length} alerta{alertas.length > 1 ? 's' : ''} de pago</div>
          {alertas.slice(0, 2).map((al, i) => (
            <div key={i} className="alerta-box-item">
              · {al.nombre} — {al.count} pago{al.count > 1 ? 's' : ''} pendiente{al.count > 1 ? 's' : ''}
            </div>
          ))}
          {alertas.length > 2 ? <div className="alerta-box-more">Ver todas →</div> : null}
        </div>
      ) : (
        <div className="ok-box">
          <div className="ok-box-title">✓ Sin alertas de pago pendientes</div>
        </div>
      )}

      <div className="semana-header">
        <div className="sec-label mb-0">Semana · <span className="txt-normal">{weekLabel}</span></div>
        {weekOffset !== 0 ? (
          <button onClick={irAHoy} className="hoy-btn">Hoy</button>
        ) : null}
      </div>

      <div className="semana-strip" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <button onClick={() => cambiarSemana(-1)} className="semana-nav">‹</button>
        <div className="semana-grid">
          {sem.map((dia, i) => {
            const iso = isoLocal(dia)
            const esH = iso === hoyISO
            const esSel = i === selectedIdx
            const tieneC = data.alumnos.some(a => (a.dias || []).includes(String(dia.getDay())))
            const fes = esFestivo(iso)
            return (
              <button key={i} onClick={() => setSelectedIdx(i)} className="semana-dia">
                <div className={'semana-dow' + (esSel ? ' is-sel' : '') + (esSel || esH ? ' is-bold' : '')}>{DIAS_ES[dia.getDay()]}</div>
                <div className={'semana-num' + (esH ? ' is-hoy' : '') + (esSel ? ' is-sel' : '')}>
                  <span className="semana-num-txt">{dia.getDate()}</span>
                </div>
                {fes
                  ? <div className="semana-fes">{FEST_CFG[fes.tipo].ico}</div>
                  : tieneC
                    ? <div className={'semana-dot' + (esSel ? ' is-sel' : '')}></div>
                    : <div className="semana-vacio"></div>}
              </button>
            )
          })}
        </div>
        <button onClick={() => cambiarSemana(1)} className="semana-nav">›</button>
      </div>

      <div className="sec-label">Clases · <span className="sec-label-dia">{nombreDiaSel}</span></div>
      {fesSel ? (
        <div className="empty">{FEST_CFG[fesSel.tipo].ico} {FEST_CFG[fesSel.tipo].label}{fesSel.nota ? ' · ' + fesSel.nota : ''}</div>
      ) : clasesDia.length ? clasesDia.map(a => {
        const idx = data.alumnos.indexOf(a)
        const sesH = data.sesiones.find(s => s.alumnoId === a.id && s.fecha === selISO)
        const turno = a.hora === '17:00' ? 't1' : a.hora === '18:30' ? 't2' : 'sin'
        const expanded = expandedId === a.id
        return (
          <div className={'card turno-' + turno} key={a.id}>
            <div className="clase-head" onClick={() => setExpandedId(expanded ? null : a.id)}>
              <div className="avatar avatar-36" style={{ background: alumnoColor(idx) }}>{initials(a.nombre)}</div>
              <div className="flex-1">
                <div className="txt-titulo">{a.nombre}</div>
                <div className="clase-meta">
                  {a.curso || ''}{a.hora ? <> · <span className={'turno-' + turno + '-txt'}>{TURNOS[a.hora] || a.hora}</span></> : null}
                </div>
              </div>
              {sesH ? <span className={'badge badge-' + sesH.estado}>{sesH.estado === 'presente' ? '✓ Pres.' : sesH.estado === 'ausente' ? '✗ Aus.' : '↩ Just.'}</span> : null}
              <span className={'clase-chevron rot' + (expanded ? ' is-open' : '')}>▾</span>
            </div>

            {expanded ? (
              <div className="clase-body">
                <div className="mini-btn-row">
                  <button
                    className={'mini-btn mini-btn-asistencia' + (sesH ? ' mini-btn-done' : '')}
                    onClick={() => !sesH && regDesdeInicio(a.id)}
                    disabled={!!sesH}
                  >
                    {sesH
                      ? (sesH.estado === 'presente' ? '✓ Presente' : sesH.estado === 'ausente' ? '✗ Ausente' : '↩ Justificada')
                      : '✓ Confirmar asistencia'}
                  </button>
                  <button className="mini-btn mini-btn-pago" onClick={() => onIrAPago(a.id)}>
                    💳 Pago
                  </button>
                </div>

                <TareaPendienteHero alumnoId={a.id} onGuardar={guardarTarea} showToast={showToast} />
                <EventoProximoHero alumnoId={a.id} onGuardar={guardarEvento} showToast={showToast} />
              </div>
            ) : null}
          </div>
        )
      }) : <div className="empty">No hay clases programadas ese día</div>}
    </div>
  )
}
