import Modal from '../Modal.jsx'
import { initials, alumnoColor } from '../../utils/helpers'

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
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div className="avatar" style={{ width: 40, height: 40, fontSize: 15, borderRadius: 11, background: alumnoColor(idx) }}>{initials(a.nombre)}</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{a.nombre}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{a.curso || ''}{a.materia ? ' · ' + a.materia : ''}</div>
        </div>
      </div>
      <div className="rcard" style={{ marginBottom: 10 }}>
        <div className="rl">Fecha</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', textTransform: 'capitalize' }}>{fechaFmt}{a.hora ? ' · ' + a.hora : ''}</div>
      </div>
      <div className="rcard" style={{ marginBottom: 14 }}>
        <div className="rl">Asistencia</div>
        <div style={{ marginTop: 4 }}>
          {ses
            ? <span className={'badge badge-' + ses.estado}>{ses.estado === 'presente' ? '✓ Presente' : ses.estado === 'ausente' ? '✗ Ausente' : '↩ Justificada'}</span>
            : <span className="badge" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}>Sin registrar</span>}
        </div>
      </div>
      {!ses ? (
        <>
          <button className="btn-primary" style={{ marginTop: 0 }} onClick={() => onRegistrar(alumnoId, fecha, 'presente')}>✓ Marcar presente</button>
          <button className="btn-secondary" onClick={() => onRegistrar(alumnoId, fecha, 'ausente')}>✗ Marcar ausente</button>
        </>
      ) : null}
      <button className="btn-secondary" onClick={onClose} style={{ marginTop: 10 }}>Cerrar</button>
    </Modal>
  )
}
