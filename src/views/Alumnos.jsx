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
    <div className={'card' + (inactivo ? ' is-inactivo' : '')} onClick={() => onVerDetalle(a.id)}>
      <div className="card-row">
        <div className="alumno-card-main">
          <div className="avatar" style={{ background: alumnoColor(idx) }}>{initials(a.nombre)}</div>
          <div className="min-w-0">
            <div className="alumno-name-row">
              <div className="alumno-name">{a.nombre}</div>
              <span className={'estado-pill ' + eb.cls}>{eb.txt}</span>
            </div>
            <div className="alumno-meta">
              {a.curso || ''}{a.materia ? ' · ' + a.materia : ''}
              {(a.dias || []).length ? ' · ' + (a.dias || []).map(d => DIAS_FULL[parseInt(d)]).join(', ') : ''}
              {a.hora ? ' · ' + (TURNOS[a.hora] || a.hora) : ''}
            </div>
          </div>
        </div>
        <div className="alumno-card-side">
          <span className={'badge ' + MODALIDAD_CFG[a.modalidad || 'fija'].badgeClass}>{MODALIDAD_CFG[a.modalidad || 'fija'].label}</span>
          <span className="precio-txt">{fmt(a[MODALIDAD_CFG[a.modalidad || 'fija'].campo]) + MODALIDAD_CFG[a.modalidad || 'fija'].suffix}</span>
          {pack ? <span className="pack-txt">{pack.restantes}/{pack.total} clases</span> : null}
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
        <div className={'mini-hero-click' + (hecho ? ' is-hecho' : '')} onClick={() => setAbiertaId(abierta ? null : key)}>
          <div className="registro-head">
            <span className={'registro-titulo' + (hecho ? ' tachado' : '')}>{hecho ? '✓ ' : ''}{it.tarea}</span>
            <span className="registro-fecha">
              {new Date(it.fecha + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
          <div className="registro-alumno">{it.alumnoNombre}</div>
          {abierta && it.evento ? <div className="registro-desc">{it.evento}</div> : null}
        </div>
        <div className="registro-acciones">
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

export default function Alumnos({ data, onNuevoAlumno, onVerDetalle, onGuardarTarea, onMarcarTarea, onEliminarTarea, onGuardarEvento, onMarcarEvento, onEliminarEvento, showToast, toastDeshacer }) {
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
    const deshacer = onEliminarTarea(alumnoId, tareaId)
    toastDeshacer('Tarea eliminada', deshacer)
  }

  function marcarEventoLocal(alumnoId, eventoId, completada) {
    onMarcarEvento && onMarcarEvento(alumnoId, eventoId, completada)
    showToast && showToast(completada ? 'Evento completado' : 'Evento marcado como pendiente')
  }

  function eliminarEventoLocal(alumnoId, eventoId) {
    const deshacer = onEliminarEvento(alumnoId, eventoId)
    toastDeshacer('Evento eliminado', deshacer)
  }

  const tareas = (data.alumnos || []).flatMap(a =>
    ((data.tareas && data.tareas[a.id]) || []).map(tt => ({ ...tt, alumnoId: a.id, alumnoNombre: a.nombre }))
  ).sort((x, y) => y.fecha.localeCompare(x.fecha))

  const eventos = (data.alumnos || []).flatMap(a =>
    ((data.eventos && data.eventos[a.id]) || []).map(ev => ({ ...ev, alumnoId: a.id, alumnoNombre: a.nombre }))
  ).sort((x, y) => x.fecha.localeCompare(y.fecha))

  return (
    <div className="section-pad">
      <button onClick={onNuevoAlumno} className="btn-primary btn-top">Nuevo Alumno</button>
      <div className="buscador">
        <svg className="buscador-ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" placeholder="Buscar alumno..." value={termino} onChange={e => setTermino(e.target.value)} />
      </div>

      <div className="section-hero">
        <div className="section-hero-header" onClick={() => setActivosOpen(o => !o)}>
          <div className="section-hero-left">
            <div className="section-hero-icon green">✓</div>
            <div className="section-hero-title">Alumnos Activos</div>
            <span className="section-hero-count">{activos.length}</span>
          </div>
          <div className={'section-hero-toggle' + (activosOpen ? ' is-open' : '')}>▾</div>
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
          <div className={'section-hero-toggle' + (inactivosOpen ? ' is-open' : '')}>▾</div>
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
          <div className={'section-hero-toggle' + (tareasOpen ? ' is-open' : '')}>▾</div>
        </div>
        {tareasOpen ? (
          <div className="section-hero-body">
            <button className="btn-secondary btn-mb" onClick={() => setNuevaTareaOpen(true)}>+ Nueva tarea</button>
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
          <div className={'section-hero-toggle' + (eventosOpen ? ' is-open' : '')}>▾</div>
        </div>
        {eventosOpen ? (
          <div className="section-hero-body">
            <button className="btn-secondary btn-mb" onClick={() => setNuevoEventoOpen(true)}>+ Nuevo evento</button>
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
