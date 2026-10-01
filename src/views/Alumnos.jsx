import { useState } from 'react'
import { ESTADO_CFG, DIAS_FULL, TURNOS, MODALIDAD_CFG } from '../utils/constants'
import { initials, alumnoColor, fmt } from '../utils/helpers'
import { getClasesPackInfo } from '../utils/business'

function AlumnoCard({ a, idx, data, onVerDetalle }) {
  const eb = ESTADO_CFG[a.estado || 'activo']
  const pack = getClasesPackInfo(data, a)
  return (
    <div className="card" onClick={() => onVerDetalle(a.id)} style={a.estado === 'baja' ? { opacity: 0.45 } : undefined}>
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
          {pack ? <span style={{ fontSize: 10, fontWeight: 700, color: '#2dd4bf' }}>{pack.restantes}/{pack.total} clases</span> : null}
        </div>
      </div>
    </div>
  )
}

export default function Alumnos({ data, onNuevoAlumno, onVerDetalle }) {
  const [termino, setTermino] = useState('')
  const [activosOpen, setActivosOpen] = useState(false)
  const [tareasOpen, setTareasOpen] = useState(false)
  const [tareaAbiertaId, setTareaAbiertaId] = useState(null)
  const { alumnos } = data
  const t = termino.toLowerCase().trim()
  const lista = alumnos.filter(a =>
    !t ||
    a.nombre.toLowerCase().includes(t) ||
    (a.curso || '').toLowerCase().includes(t) ||
    (a.materia || '').toLowerCase().includes(t)
  )

  const activos = lista.filter(a => (a.estado || 'activo') === 'activo')
  const otros = lista.filter(a => (a.estado || 'activo') !== 'activo')

  const tareas = (data.alumnos || []).flatMap(a =>
    ((data.tareas && data.tareas[a.id]) || []).map(tt => ({ ...tt, alumnoId: a.id, alumnoNombre: a.nombre }))
  ).sort((x, y) => y.fecha.localeCompare(x.fecha))

  return (
    <div className="section-pad">
      <button onClick={onNuevoAlumno} className="btn-primary" style={{ marginTop: 0, marginBottom: 12 }}>Nuevo Alumno</button>
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" placeholder="Buscar alumno..." value={termino} onChange={e => setTermino(e.target.value)} style={{ paddingLeft: 34 }} />
      </div>

      <div className="section-hero">
        <div className="section-hero-header" onClick={() => setActivosOpen(o => !o)}>
          <div className="section-hero-left">
            <div className="section-hero-icon green">✓</div>
            <div className="section-hero-title">Alumnos Activos</div>
            <span className="section-hero-count">{activos.length}</span>
          </div>
          <div className="section-hero-toggle" style={{ transform: activosOpen ? 'rotate(180deg)' : 'none' }}>▾</div>
        </div>
        {activosOpen ? (
          <div className="section-hero-body">
            {!activos.length
              ? <p className="empty">Sin alumnos activos.</p>
              : activos.map(a => <AlumnoCard key={a.id} a={a} idx={alumnos.indexOf(a)} data={data} onVerDetalle={onVerDetalle} />)}
          </div>
        ) : null}
      </div>

      <div className="section-hero">
        <div className="section-hero-header" onClick={() => setTareasOpen(o => !o)}>
          <div className="section-hero-left">
            <div className="section-hero-icon purple">📝</div>
            <div className="section-hero-title">Tareas</div>
            <span className="section-hero-count">{tareas.length}</span>
          </div>
          <div className="section-hero-toggle" style={{ transform: tareasOpen ? 'rotate(180deg)' : 'none' }}>▾</div>
        </div>
        {tareasOpen ? (
          <div className="section-hero-body">
            {!tareas.length
              ? <p className="empty">Sin tareas registradas.</p>
              : tareas.map(tt => {
                const key = tt.alumnoId + '-' + tt.id
                const abierta = tareaAbiertaId === key
                return (
                  <div key={key} className="tarea-perfil-item mini-hero-click" onClick={() => setTareaAbiertaId(abierta ? null : key)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{tt.tarea}</span>
                      <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>
                        {new Date(tt.fecha + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{tt.alumnoNombre}</div>
                    {abierta && tt.evento ? <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 6 }}>{tt.evento}</div> : null}
                  </div>
                )
              })}
          </div>
        ) : null}
      </div>

      <div className="sec-label">Otros alumnos</div>
      {!alumnos.length
        ? <p className="empty">Sin alumnos registrados.</p>
        : !lista.length
          ? <p className="empty">Sin resultados.</p>
          : !otros.length
            ? <p className="empty">Sin alumnos pausados o de baja.</p>
            : otros.map(a => <AlumnoCard key={a.id} a={a} idx={alumnos.indexOf(a)} data={data} onVerDetalle={onVerDetalle} />)}
    </div>
  )
}
