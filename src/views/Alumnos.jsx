import { useState } from 'react'
import ScreenHeader from '../components/ScreenHeader.jsx'
import { ESTADO_CFG, DIAS_FULL, TURNOS, MODALIDAD_CFG } from '../utils/constants'
import { initials, alumnoColor, fmt } from '../utils/helpers'

export default function Alumnos({ data, onNuevoAlumno, onVerDetalle }) {
  const [termino, setTermino] = useState('')
  const { alumnos } = data
  const t = termino.toLowerCase().trim()
  const lista = alumnos.filter(a =>
    !t ||
    a.nombre.toLowerCase().includes(t) ||
    (a.curso || '').toLowerCase().includes(t) ||
    (a.materia || '').toLowerCase().includes(t)
  )

  return (
    <div className="section-pad">
      <ScreenHeader title="Alumnos" />
      <button onClick={onNuevoAlumno} className="btn-primary" style={{ marginTop: 0, marginBottom: 12 }}>Nuevo Alumno</button>
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" placeholder="Buscar alumno..." value={termino} onChange={e => setTermino(e.target.value)} style={{ paddingLeft: 34 }} />
      </div>

      {!alumnos.length
        ? <p className="empty">Sin alumnos registrados.</p>
        : !lista.length
          ? <p className="empty">Sin resultados.</p>
          : lista.map(a => {
            const idx = alumnos.indexOf(a)
            const eb = ESTADO_CFG[a.estado || 'activo']
            return (
              <div className="card" key={a.id} onClick={() => onVerDetalle(a.id)} style={a.estado === 'baja' ? { opacity: 0.45 } : undefined}>
                <div className="card-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                    <div className="avatar" style={{ background: alumnoColor(idx) }}>{initials(a.nombre)}</div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <div className="alumno-name">{a.nombre}</div>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 10, background: eb.bg, color: eb.color }}>{eb.txt}</span>
                      </div>
                      <div className="alumno-meta">
                        {a.curso || ''}{a.materia ? ' · ' + a.materia : ''}
                        {(a.dias || []).length ? ' · ' + (a.dias || []).map(d => DIAS_FULL[parseInt(d)]).join(', ') : ''}
                        {a.hora ? ' · ' + (TURNOS[a.hora] || a.hora) : ''}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                    <span className={'badge ' + MODALIDAD_CFG[a.modalidad || 'fija'].badgeClass}>{MODALIDAD_CFG[a.modalidad || 'fija'].label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#4d9fff' }}>{fmt(a[MODALIDAD_CFG[a.modalidad || 'fija'].campo]) + MODALIDAD_CFG[a.modalidad || 'fija'].suffix}</span>
                  </div>
                </div>
              </div>
            )
          })}
    </div>
  )
}
