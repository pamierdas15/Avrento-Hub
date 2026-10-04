import Modal from '../Modal.jsx'
import { initials, alumnoColor, etiquetaTurno } from '../../utils/helpers'

export default function EventoModal({ open, alumnoId, fecha, data, onClose, onRegistrar }) {
  if (!open || !alumnoId) return <Modal open={open}><button className="btn-secondary" onClick={onClose}>Cerrar</button></Modal>
  const { alumnos, sesiones } = data
  const a = alumnos.find(x => x.id === alumnoId)
  if (!a) return <Modal open={open}><button className="btn-secondary" onClick={onClose}>Cerrar</button></Modal>

  const idx = alumnos.indexOf(a)
  const ses = sesiones.find(s => s.alumnoId === alumnoId && s.fecha === fecha)
  const fechaFmt = new Date(fecha + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <Modal open={open}>
      <div className="evento-head">
        <div className="avatar avatar-40" style={{ background: alumnoColor(idx) }}>{initials(a.nombre)}</div>
        <div>
          <div className="modal-head-title">{a.nombre}</div>
          <div className="detalle-sub">{a.curso || ''}{a.materia ? ' · ' + a.materia : ''}</div>
        </div>
      </div>
      <div className="rcard mb-10">
        <div className="rl">Fecha</div>
        <div className="txt-titulo txt-cap">{fechaFmt}{a.hora ? ' · ' + etiquetaTurno(a) : ''}</div>
      </div>
      <div className="rcard mb-14">
        <div className="rl">Asistencia</div>
        <div className="mt-4">
          {ses
            ? <span className={'badge badge-' + ses.estado}>{ses.estado === 'presente' ? '✓ Presente' : ses.estado === 'ausente' ? '✗ Ausente' : '↩ Justificada'}</span>
            : <span className="badge badge-sinreg">Sin registrar</span>}
        </div>
      </div>
      {!ses ? (
        <>
          <button className="btn-primary mt-0" onClick={() => onRegistrar(alumnoId, fecha, 'presente')}>✓ Marcar presente</button>
          <button className="btn-secondary" onClick={() => onRegistrar(alumnoId, fecha, 'ausente')}>✗ Marcar ausente</button>
        </>
      ) : null}
      <button className="btn-secondary mt-10" onClick={onClose}>Cerrar</button>
    </Modal>
  )
}
