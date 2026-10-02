import { useState } from 'react'
import { estadoCfg, DIAS_FULL, TURNOS, MODALIDAD_CFG } from '../utils/constants'
import { initials, alumnoColor, fmt } from '../utils/helpers'
import { getClasesPackInfo } from '../utils/business'
import NuevoRegistroModal from '../components/modals/NuevoRegistroModal.jsx'

function AlumnoCard({ a, idx, data, onVerDetalle }) {
  const eb = estadoCfg(a.estado || 'activo')
  const pack = getClasesPackInfo(data, a)
  const inactivo = (a.estado || 'activo') !== 'activo'
  return (
    <div className="card" onClick={() => onVerDetalle(a.id)} style={inactivo ? { opacity: 0.45 } : undefined}>
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

function ListaRegistros({ items, abiertaId, setAbiertaId, onMarcar, onEliminar, etiquetaHecho }) {
  if (!items.length) return <p className="empty">Sin registros.</p>
  return items.map(it => {
    const key = it.alumnoId + '-' + it.id
    const abierta = abiertaId === key
    const hecho = !!it.completada
    return (
      <div key={key} className="tarea-perfil-item tarea-perfil-row">
        <div className="mini-hero-click" style={{ cursor: 'pointer', opacity: hecho ? 0.55 : 1 }} onClick={() => setAbiertaId(abierta ? null : key)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', textDecoration: hecho ? 'line-through' : 'none' }}>{hecho ? '✓ ' : ''}{it.tarea}</span>
            <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>
              {new Date(it.fecha + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
          <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{it.alumnoNombre}</div>
          {abierta && it.evento ? <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 6 }}>{it.evento}</div> : null}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
          <button
            className={'tarea-realizada-btn' + (hecho ? ' tarea-realizada-btn-done' : '')}
            onClick={e => { e.stopPropagation(); onMarcar(it.alumnoId, it.id, !hecho) }}
          >{hecho ? '↺ Deshacer' : etiquetaHecho}</button>
          <button className="icon-btn" onClick={e => { e.stopPropagation(); onEliminar(it.alumnoId, it.id) }}>✕</button>
        </div>
      </div>
    )
  })
}

export default function Alumnos({ data, onNuevoAlumno, onVerDetalle, onGuardarTarea, onMarcarTarea, onEliminarTarea, onGuardarEvento, onMarcarEvento, onEliminarEvento, showToast }) {
  const [termino, setTermino] = useState('')
  const [activosOpen, setActivosOpen] = useState(false)
  const [inactivosOpen, setInactivosOpen] = useState(false)
  const [tareasOpen, setTareasOpen] = useState(false)
  const [eventosOpen, setEventosOpen] = useState(false)
  const [tareaAbiertaId, setTareaAbiertaId] = useState(null)
  const [eventoAbiertoId, setEventoAbiertoId] = useState(null)
  const [nuevaTareaOpen, setNuevaTareaOpen] = useState(false)
  const [nuevoEventoOpen, setNuevoEventoOpen] = useState(false)
  const { alumnos } = data
  const t = termino.toLowerCase().trim()
  const lista = alumnos.filter(a =>
    !t ||
    a.nombre.toLowerCase().includes(t) ||
    (a.curso || '').toLowerCase().includes(t) ||
    (a.materia || '').toLowerCase().includes(t)
  )

  const activos = lista.filter(a => (a.estado || 'activo') === 'activo')
  const inactivos = lista.filter(a => (a.estado || 'activo') !== 'activo')

  function marcarTareaLocal(alumnoId, tareaId, completada) {
    onMarcarTarea && onMarcarTarea(alumnoId, tareaId, completada)
    showToast && showToast(completada ? 'Tarea completada' : 'Tarea marcada como pendiente')
  }

  function eliminarTareaLocal(alumnoId, tareaId) {
    onEliminarTarea && onEliminarTarea(alumnoId, tareaId)
    showToast && showToast('Tarea eliminada')
  }

  function marcarEventoLocal(alumnoId, eventoId, completada) {
    onMarcarEvento && onMarcarEvento(alumnoId, eventoId, completada)
    showToast && showToast(completada ? 'Evento completado' : 'Evento marcado como pendiente')
  }

  function eliminarEventoLocal(alumnoId, eventoId) {
    onEliminarEvento && onEliminarEvento(alumnoId, eventoId)
    showToast && showToast('Evento eliminado')
  }

  const tareas = (data.alumnos || []).flatMap(a =>
    ((data.tareas && data.tareas[a.id]) || []).map(tt => ({ ...tt, alumnoId: a.id, alumnoNombre: a.nombre }))
  ).sort((x, y) => y.fecha.localeCompare(x.fecha))

  const eventos = (data.alumnos || []).flatMap(a =>
    ((data.eventos && data.eventos[a.id]) || []).map(ev => ({ ...ev, alumnoId: a.id, alumnoNombre: a.nombre }))
  ).sort((x, y) => x.fecha.localeCompare(y.fecha))

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
        <div className="section-hero-header" onClick={() => setInactivosOpen(o => !o)}>
          <div className="section-hero-left">
            <div className="section-hero-icon red">✗</div>
            <div className="section-hero-title">Alumnos Inactivos</div>
            <span className="section-hero-count">{inactivos.length}</span>
          </div>
          <div className="section-hero-toggle" style={{ transform: inactivosOpen ? 'rotate(180deg)' : 'none' }}>▾</div>
        </div>
        {inactivosOpen ? (
          <div className="section-hero-body">
            {!inactivos.length
              ? <p className="empty">Sin alumnos inactivos.</p>
              : inactivos.map(a => <AlumnoCard key={a.id} a={a} idx={alumnos.indexOf(a)} data={data} onVerDetalle={onVerDetalle} />)}
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
            <button className="btn-secondary" style={{ marginBottom: 10 }} onClick={() => setNuevaTareaOpen(true)}>+ Nueva tarea</button>
            <ListaRegistros
              items={tareas}
              abiertaId={tareaAbiertaId}
              setAbiertaId={setTareaAbiertaId}
              onMarcar={marcarTareaLocal}
              onEliminar={eliminarTareaLocal}
              etiquetaHecho="✓ Realizada"
            />
          </div>
        ) : null}
      </div>

      <div className="section-hero">
        <div className="section-hero-header" onClick={() => setEventosOpen(o => !o)}>
          <div className="section-hero-left">
            <div className="section-hero-icon blue">📅</div>
            <div className="section-hero-title">Eventos Próximos</div>
            <span className="section-hero-count">{eventos.length}</span>
          </div>
          <div className="section-hero-toggle" style={{ transform: eventosOpen ? 'rotate(180deg)' : 'none' }}>▾</div>
        </div>
        {eventosOpen ? (
          <div className="section-hero-body">
            <button className="btn-secondary" style={{ marginBottom: 10 }} onClick={() => setNuevoEventoOpen(true)}>+ Nuevo evento</button>
            <ListaRegistros
              items={eventos}
              abiertaId={eventoAbiertoId}
              setAbiertaId={setEventoAbiertoId}
              onMarcar={marcarEventoLocal}
              onEliminar={eliminarEventoLocal}
              etiquetaHecho="✓ Realizado"
            />
          </div>
        ) : null}
      </div>

      {!alumnos.length
        ? <p className="empty">Sin alumnos registrados.</p>
        : t && !lista.length
          ? <p className="empty">Sin resultados.</p>
          : null}

      <NuevoRegistroModal
        open={nuevaTareaOpen}
        tipo="tarea"
        alumnos={alumnos}
        onGuardar={onGuardarTarea}
        onClose={() => setNuevaTareaOpen(false)}
        showToast={showToast}
      />
      <NuevoRegistroModal
        open={nuevoEventoOpen}
        tipo="evento"
        alumnos={alumnos}
        onGuardar={onGuardarEvento}
        onClose={() => setNuevoEventoOpen(false)}
        showToast={showToast}
      />
    </div>
  )
}
