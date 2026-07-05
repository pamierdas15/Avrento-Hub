import { useState, useRef } from 'react'
import { DIAS_ES, MESES, TURNOS, FEST_CFG, LOGO_DATA_URI } from '../utils/constants'
import { todayStr, initials, alumnoColor, getWeekDates } from '../utils/helpers'
import { getAlertas } from '../utils/business'

export default function Inicio({ data, esFestivo, registrarSesion, showToast, onGoTab, onNuevoAlumno, onVerAlertas }) {
  const hoy = new Date()
  const hoyISO = todayStr()
  const dsHoy = hoy.getDay()
  const alertas = getAlertas(data)

  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedIdx, setSelectedIdx] = useState(dsHoy === 0 ? 6 : dsHoy - 1)
  const touchX = useRef(null)

  const sem = getWeekDates(weekOffset)
  const selDate = sem[selectedIdx]
  const selISO = selDate.toISOString().slice(0, 10)
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
    if (ok) showToast('Asistencia registrada')
  }

  return (
    <div className="section-pad">
      <div className="app-header">
        <img src={LOGO_DATA_URI} className="logo-img" alt="AvrentoHub" />
        <div className="logo-text"><span className="logo-avrento">Avrento</span><span className="logo-hub">Hub</span></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 18 }}>
        <button className="quick-btn" onClick={onNuevoAlumno}>
          <div className="qico" style={{ background: 'rgba(37,99,235,0.2)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4d9fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>Nuevo alumno</span>
        </button>
        <button className="quick-btn" onClick={() => onGoTab('asistencia')}>
          <div className="qico" style={{ background: 'rgba(29,158,117,0.2)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>Reg. clase</span>
        </button>
        <button className="quick-btn" onClick={() => onGoTab('pagos')}>
          <div className="qico" style={{ background: 'rgba(124,58,237,0.2)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>Reg. pago</span>
        </button>
      </div>

      {alertas.length ? (
        <div
          style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 14, padding: '12px 14px', marginBottom: 16, cursor: 'pointer' }}
          onClick={onVerAlertas}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: '#fbbf24', marginBottom: 4 }}>⚠ {alertas.length} alerta{alertas.length > 1 ? 's' : ''} de pago</div>
          {alertas.slice(0, 2).map((al, i) => (
            <div key={i} style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>
              · {al.nombre} — {al.count} pago{al.count > 1 ? 's' : ''} pendiente{al.count > 1 ? 's' : ''}
            </div>
          ))}
          {alertas.length > 2 ? <div style={{ fontSize: 11, color: '#fbbf24', marginTop: 2 }}>Ver todas →</div> : null}
        </div>
      ) : (
        <div style={{ background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.15)', borderRadius: 14, padding: '10px 14px', marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#34d399' }}>✓ Sin alertas de pago pendientes</div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div className="sec-label" style={{ marginBottom: 0 }}>Semana · <span style={{ textTransform: 'none' }}>{weekLabel}</span></div>
        {weekOffset !== 0 ? (
          <button onClick={irAHoy} style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', background: 'var(--accent-soft)', border: '1px solid var(--accent-line)', borderRadius: 999, padding: '3px 9px', cursor: 'pointer' }}>Hoy</button>
        ) : null}
      </div>

      <div
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '10px 6px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 2, touchAction: 'pan-y' }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <button onClick={() => cambiarSemana(-1)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 16, padding: '0 4px', cursor: 'pointer', flexShrink: 0 }}>‹</button>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, flex: 1 }}>
          {sem.map((dia, i) => {
            const iso = dia.toISOString().slice(0, 10)
            const esH = iso === hoyISO
            const esSel = i === selectedIdx
            const tieneC = data.alumnos.some(a => (a.dias || []).includes(String(dia.getDay())))
            const fes = esFestivo(iso)
            return (
              <button key={i} onClick={() => setSelectedIdx(i)} style={{ textAlign: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0' }}>
                <div style={{ fontSize: 9, color: esSel ? '#4d9fff' : 'rgba(255,255,255,0.4)', fontWeight: esSel || esH ? 700 : 400, textTransform: 'uppercase' }}>{DIAS_ES[dia.getDay()]}</div>
                <div style={{ width: 28, height: 28, borderRadius: '50%', margin: '3px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', background: esSel ? 'linear-gradient(135deg,#1a4fd6,#2563eb)' : 'transparent', border: esSel ? 'none' : esH ? '1px solid rgba(77,159,255,0.5)' : '1px solid rgba(255,255,255,0.08)', boxShadow: esSel ? '0 4px 12px rgba(77,159,255,0.4)' : 'none' }}>
                  <span style={{ fontSize: 11, fontWeight: esSel ? 700 : 400, color: esSel ? '#fff' : esH ? '#4d9fff' : 'rgba(255,255,255,0.65)' }}>{dia.getDate()}</span>
                </div>
                {fes
                  ? <div style={{ fontSize: 10, textAlign: 'center' }}>{FEST_CFG[fes.tipo].ico}</div>
                  : tieneC
                    ? <div style={{ width: 4, height: 4, borderRadius: '50%', background: esSel ? '#4d9fff' : 'rgba(77,159,255,0.5)', margin: '2px auto' }}></div>
                    : <div style={{ height: 6 }}></div>}
              </button>
            )
          })}
        </div>
        <button onClick={() => cambiarSemana(1)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 16, padding: '0 4px', cursor: 'pointer', flexShrink: 0 }}>›</button>
      </div>

      <div className="sec-label">Clases · <span style={{ textTransform: 'capitalize', fontWeight: 400, color: 'rgba(255,255,255,0.45)' }}>{nombreDiaSel}</span></div>
      {fesSel ? (
        <div className="empty">{FEST_CFG[fesSel.tipo].ico} {FEST_CFG[fesSel.tipo].label}{fesSel.nota ? ' · ' + fesSel.nota : ''}</div>
      ) : clasesDia.length ? clasesDia.map(a => {
        const idx = data.alumnos.indexOf(a)
        const sesH = data.sesiones.find(s => s.alumnoId === a.id && s.fecha === selISO)
        const tc = a.hora === '17:00' ? { border: 'rgba(77,159,255,0.5)', text: '#4d9fff' } : a.hora === '18:30' ? { border: 'rgba(251,146,60,0.5)', text: '#fb923c' } : { border: 'rgba(255,255,255,0.15)', text: 'rgba(255,255,255,0.7)' }
        return (
          <div className="card" key={a.id} style={{ borderLeft: '3px solid ' + tc.border }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="avatar" style={{ width: 36, height: 36, fontSize: 12, borderRadius: 10, background: alumnoColor(idx) }}>{initials(a.nombre)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{a.nombre}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>
                  {a.curso || ''}{a.hora ? <> · <span style={{ color: tc.text }}>{TURNOS[a.hora] || a.hora}</span></> : null}
                </div>
              </div>
              {sesH
                ? <span className={'badge badge-' + sesH.estado}>{sesH.estado === 'presente' ? '✓ Pres.' : sesH.estado === 'ausente' ? '✗ Aus.' : '↩ Just.'}</span>
                : <button onClick={() => regDesdeInicio(a.id)} style={{ padding: '6px 10px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#1a4fd6,#2563eb)', color: '#fff', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>Registrar</button>}
            </div>
          </div>
        )
      }) : <div className="empty">No hay clases programadas ese día</div>}
    </div>
  )
}
