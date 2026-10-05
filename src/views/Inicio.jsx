import { useState, useRef } from 'react'
import { DIAS_ES, MESES, FEST_CFG } from '../utils/constants'
import { todayStr, isoLocal, initials, alumnoColor, getWeekDates, etiquetaTurno, claseTurno } from '../utils/helpers'
import { getAlertas, getTareasPendientes, clasesDelDia, agruparPorTurno } from '../utils/business'
import { CabeceraTurno, badgeClase } from '../components/modals/EventoModal.jsx'
import TareaPendienteHero from '../components/TareaPendienteHero.jsx'
import EventoProximoHero from '../components/EventoProximoHero.jsx'

export default function Inicio({ data, esFestivo, registrarSesion, guardarTarea, guardarEvento, showToast, onIrAPago, onVerAlertas, onVerTareas, onAbrirClase, cancelarClase, restaurarClase, toastDeshacer }) {
  const hoy = new Date()
  const hoyISO = todayStr()
  const dsHoy = hoy.getDay()
  const alertas = getAlertas(data)

  // Tareas sin marcar como realizadas, de todos los alumnos, de la más
  // antigua a la más reciente. Al borrarlas o marcarlas desaparecen del aviso.
  const tareasPendientes = getTareasPendientes(data)

  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedIdx, setSelectedIdx] = useState(dsHoy === 0 ? 6 : dsHoy - 1)
  const [expandedId, setExpandedId] = useState(null)
  const touchX = useRef(null)

  const sem = getWeekDates(weekOffset)
  const selDate = sem[selectedIdx]
  const selISO = isoLocal(selDate)
  const esSelHoy = selISO === hoyISO
  const nombreDiaSel = esSelHoy ? 'Hoy' : selDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
  const fesSel = esFestivo(selISO)

  // Clases del día elegido: horario fijo + cambios puntuales de esa fecha,
  // agrupadas por turno con sus plazas ocupadas.
  const clasesDia = clasesDelDia(data, selISO)
  const gruposDia = agruparPorTurno(clasesDia, false)

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
      ) : null}

      {tareasPendientes.length ? (
        <div className="tareas-box" onClick={onVerTareas}>
          <div className="tareas-box-title">📝 {tareasPendientes.length} tarea{tareasPendientes.length > 1 ? 's' : ''} pendiente{tareasPendientes.length > 1 ? 's' : ''}</div>
          {tareasPendientes.slice(0, 3).map(t => (
            <div key={t.alumnoId + '-' + t.id} className="alerta-box-item">
              · {t.alumnoNombre} — {t.tarea}
              {t.fecha ? <span className={'tareas-box-fecha' + (t.fecha < hoyISO ? ' vencida' : '')}> · {new Date(t.fecha + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span> : null}
            </div>
          ))}
          {tareasPendientes.length > 3 ? <div className="tareas-box-more">Ver todas →</div> : null}
        </div>
      ) : null}

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
            const tieneC = clasesDelDia(data, iso).some(c => !c.cancelada)
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
      ) : (
        <>
          {!clasesDia.length ? <div className="empty">No hay clases programadas ese día</div> : gruposDia.map(g => (
            <div key={g.clave}>
              <CabeceraTurno grupo={g} />
              {g.clases.map(c => {
                const a = c.alumno
                const idx = data.alumnos.indexOf(a)
                const sesH = data.sesiones.find(s => s.alumnoId === a.id && s.fecha === selISO)
                const turno = claseTurno(c)
                const expanded = expandedId === c.key
                const b = badgeClase(c)
                return (
                  <div className={'card turno-' + turno + (c.cancelada ? ' is-cancelada' : '')} key={c.key}>
                    <div className="clase-head" onClick={() => setExpandedId(expanded ? null : c.key)}>
                      <div className="avatar avatar-36" style={{ background: alumnoColor(idx) }}>{initials(a.nombre)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="txt-titulo">{a.nombre}</div>
                        <div className="clase-meta">
                          {a.curso || ''}{c.hora ? <> · <span className={'turno-' + turno + '-txt'}>{etiquetaTurno(c)}</span></> : null}
                        </div>
                        {b ? <span className={'badge badge-mini ml-0 ' + b.cls}>{b.txt}</span> : null}
                      </div>
                      {sesH ? <span className={'badge badge-' + sesH.estado}>{sesH.estado === 'presente' ? '✓ Pres.' : sesH.estado === 'ausente' ? '✗ Aus.' : '↩ Just.'}</span> : null}
                      <span className={'clase-chevron rot' + (expanded ? ' is-open' : '')}>▾</span>
                    </div>

                    {expanded ? (
                      <div className="clase-body">
                        {c.cancelada ? (
                          <div className="mini-btn-row">
                            <button className="mini-btn mini-btn-restaurar" onClick={() => toastDeshacer('Clase restaurada', restaurarClase(c))}>↺ Restaurar clase</button>
                          </div>
                        ) : (
                          <>
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
                            <div className="mini-btn-row">
                              <button className="mini-btn mini-btn-mover" onClick={() => onAbrirClase({ modo: 'mover', fecha: selISO, clase: c })}>⇄ Mover</button>
                              <button className="mini-btn mini-btn-cancelar" onClick={() => toastDeshacer(c.puntual ? 'Clase quitada' : 'Clase cancelada', cancelarClase(c))}>{c.puntual ? '✕ Quitar' : '✕ Cancelar'}</button>
                            </div>

                            <TareaPendienteHero alumnoId={a.id} onGuardar={guardarTarea} showToast={showToast} />
                            <EventoProximoHero alumnoId={a.id} onGuardar={guardarEvento} showToast={showToast} />
                          </>
                        )}
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          ))}
          <button className="btn-secondary btn-anadir-clase" onClick={() => onAbrirClase({ modo: 'anadir', fecha: selISO })}>+ Añadir clase puntual</button>
        </>
      )}
    </div>
  )
}
