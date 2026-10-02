import Modal from '../Modal.jsx'
import { estadoCfg, MODALIDAD_CFG } from '../../utils/constants'
import { initials, alumnoColor, fmt } from '../../utils/helpers'
import { getClasesPackInfo } from '../../utils/business'

export default function DetalleModal({ open, alumnoId, data, onClose, onEditar }) {
  if (!open || !alumnoId) return <Modal open={open}><button className="btn-secondary" onClick={onClose}>Cerrar</button></Modal>
  const a = data.alumnos.find(x => x.id === alumnoId)
  if (!a) return <Modal open={open}><button className="btn-secondary" onClick={onClose}>Cerrar</button></Modal>

  const idx = data.alumnos.indexOf(a)
  const ses = data.sesiones.filter(s => s.alumnoId === alumnoId)
  const pres = ses.filter(s => s.estado === 'presente').length
  const aus = ses.filter(s => s.estado === 'ausente').length
  const just = ses.filter(s => s.estado === 'justificada').length
  const cobrado = data.pagos.filter(p => p.alumnoId === alumnoId && p.tipo === 'recibido').reduce((s, p) => s + p.importe, 0)
  const pendiente = data.pagos.filter(p => p.alumnoId === alumnoId && p.tipo === 'pendiente').reduce((s, p) => s + p.importe, 0)
  const eb = estadoCfg(a.estado || 'activo')
  const tareas = ((data.tareas && data.tareas[alumnoId]) || []).slice().sort((x, y) => y.fecha.localeCompare(x.fecha))
  const eventos = ((data.eventos && data.eventos[alumnoId]) || []).slice().sort((x, y) => x.fecha.localeCompare(y.fecha))
  const pack = getClasesPackInfo(data, a)

  return (
    <Modal open={open}>
      <div className="detalle-head">
        <div className="avatar avatar-48" style={{ background: alumnoColor(idx) }}>{initials(a.nombre)}</div>
        <div>
          <div className="detalle-nombre">{a.nombre}</div>
          <div className="detalle-sub">{a.curso || ''}{a.materia ? ' · ' + a.materia : ''}</div>
          <div className="badges-row">
            <span className={'badge ' + MODALIDAD_CFG[a.modalidad || 'fija'].badgeClass}>
              {MODALIDAD_CFG[a.modalidad || 'fija'].label} · {fmt(a[MODALIDAD_CFG[a.modalidad || 'fija'].campo]) + MODALIDAD_CFG[a.modalidad || 'fija'].suffix}
            </span>
            <span className={'estado-pill estado-pill-lg ' + eb.cls}>{eb.txt}</span>
          </div>
          {a.alta ? <div className="detalle-alta">Alta: {new Date(a.alta + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</div> : null}
        </div>
      </div>

      {a.notas ? <div className="detalle-notas">{a.notas}</div> : null}

      <div className="stats-3">
        <div className="rcard"><div className="rl">Presentes</div><div className="rv green">{pres}</div></div>
        <div className="rcard"><div className="rl">Ausentes</div><div className="rv red">{aus}</div></div>
        <div className="rcard"><div className="rl">Justif.</div><div className="rv purple">{just}</div></div>
      </div>
      <div className="stats-2">
        <div className="rcard"><div className="rl">Cobrado</div><div className="rv green">{fmt(cobrado)}</div></div>
        <div className="rcard"><div className="rl">Pendiente</div><div className="rv red">{fmt(pendiente)}</div></div>
      </div>

      {pack ? (
        <div className="rcard rcard-pack">
          <div className="rl">Pack de clases</div>
          <div className="rv teal">{pack.restantes}/{pack.total} clases restantes</div>
        </div>
      ) : null}

      {tareas.length ? (
        <div className="detalle-seccion">
          <div className="sec-label">Tareas pendientes</div>
          {tareas.map(t => (
            <div key={t.id} className="tarea-perfil-item">
              <div className="registro-head">
                <span className="registro-titulo">{t.tarea}</span>
                <span className="registro-fecha">
                  {new Date(t.fecha + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              {t.evento ? <div className="detalle-item-desc">{t.evento}</div> : null}
            </div>
          ))}
        </div>
      ) : null}

      {eventos.length ? (
        <div className="detalle-seccion">
          <div className="sec-label">Eventos próximos</div>
          {eventos.map(ev => (
            <div key={ev.id} className="tarea-perfil-item">
              <div className="registro-head">
                <span className="registro-titulo">{ev.tarea}</span>
                <span className="registro-fecha">
                  {new Date(ev.fecha + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              {ev.evento ? <div className="detalle-item-desc">{ev.evento}</div> : null}
            </div>
          ))}
        </div>
      ) : null}

      <button className="btn-primary" onClick={() => onEditar(a.id)}>Editar datos</button>
      <button className="btn-secondary" onClick={onClose}>Cerrar</button>
    </Modal>
  )
}
