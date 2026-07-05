import Modal from '../Modal.jsx'
import { ESTADO_CFG } from '../../utils/constants'
import { initials, alumnoColor, fmt } from '../../utils/helpers'

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
  const eb = ESTADO_CFG[a.estado || 'activo']

  return (
    <Modal open={open}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div className="avatar" style={{ width: 48, height: 48, fontSize: 18, borderRadius: 14, background: alumnoColor(idx) }}>{initials(a.nombre)}</div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{a.nombre}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{a.curso || ''}{a.materia ? ' · ' + a.materia : ''}</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
            <span className={'badge ' + (a.modalidad === 'fija' ? 'badge-fija' : 'badge-sesion')}>
              {a.modalidad === 'fija' ? 'Mensual · ' + fmt(a.tarifa) : 'Por sesión · ' + fmt(a.precioSesion)}
            </span>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: eb.bg, color: eb.color }}>{eb.txt}</span>
          </div>
          {a.alta ? <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>Alta: {new Date(a.alta + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</div> : null}
        </div>
      </div>

      {a.notas ? <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.05)', padding: '8px 10px', borderRadius: 8, marginBottom: 12 }}>{a.notas}</div> : null}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 10 }}>
        <div className="rcard"><div className="rl">Presentes</div><div className="rv green">{pres}</div></div>
        <div className="rcard"><div className="rl">Ausentes</div><div className="rv red">{aus}</div></div>
        <div className="rcard"><div className="rl">Justif.</div><div className="rv purple">{just}</div></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
        <div className="rcard"><div className="rl">Cobrado</div><div className="rv green">{fmt(cobrado)}</div></div>
        <div className="rcard"><div className="rl">Pendiente</div><div className="rv red">{fmt(pendiente)}</div></div>
      </div>

      <button className="btn-primary" onClick={() => onEditar(a.id)}>Editar datos</button>
      <button className="btn-secondary" onClick={onClose}>Cerrar</button>
    </Modal>
  )
}
