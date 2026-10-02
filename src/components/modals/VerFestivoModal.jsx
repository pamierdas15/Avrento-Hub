import Modal from '../Modal.jsx'
import { FEST_CFG, TURNOS } from '../../utils/constants'
import { initials, alumnoColor } from '../../utils/helpers'

export default function VerFestivoModal({ open, fecha, festivo, data, onClose, onEliminar }) {
  if (!open || !festivo) return <Modal open={open}><button className="btn-secondary" onClick={onClose}>Cerrar</button></Modal>
  const fc = FEST_CFG[festivo.tipo]
  const dia = new Date(fecha + 'T12:00:00')
  const diaStr = dia.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const afectados = data.alumnos.filter(a => (a.dias || []).includes(String(dia.getDay())))

  return (
    <Modal open={open}>
      <div className="fes-head">
        <div className="fes-ico-lg" style={{ background: fc.bg }}>{fc.ico}</div>
        <div>
          <div className="modal-head-title" style={{ color: fc.color }}>{fc.label}</div>
          <div className="detalle-sub txt-cap">{diaStr}</div>
          {festivo.nota ? <div className="fes-nota">{festivo.nota}</div> : null}
        </div>
      </div>

      {afectados.length ? (
        <>
          <div className="subtitulo-caps">⚠ Alumnos afectados</div>
          {afectados.map(a => (
            <div key={a.id} className="afectado-row">
              <div className="avatar avatar-28" style={{ background: alumnoColor(data.alumnos.indexOf(a)) }}>{initials(a.nombre)}</div>
              <span className="afectado-nombre">{a.nombre}</span>
              <span className="afectado-turno">{TURNOS[a.hora] || a.hora || ''}</span>
            </div>
          ))}
        </>
      ) : null}

      <button className="btn-danger" onClick={() => onEliminar(fecha)}>Desbloquear este día</button>
      <button className="btn-secondary" onClick={onClose}>Cerrar</button>
    </Modal>
  )
}
