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
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: fc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{fc.ico}</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: fc.color }}>{fc.label}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', textTransform: 'capitalize' }}>{diaStr}</div>
          {festivo.nota ? <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{festivo.nota}</div> : null}
        </div>
      </div>

      {afectados.length ? (
        <>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>⚠ Alumnos afectados</div>
          {afectados.map(a => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: 'rgba(255,255,255,0.04)', borderRadius: 10, marginBottom: 6 }}>
              <div className="avatar" style={{ width: 28, height: 28, fontSize: 10, borderRadius: 8, background: alumnoColor(data.alumnos.indexOf(a)) }}>{initials(a.nombre)}</div>
              <span style={{ fontSize: 13, color: '#fff' }}>{a.nombre}</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginLeft: 'auto' }}>{TURNOS[a.hora] || a.hora || ''}</span>
            </div>
          ))}
        </>
      ) : null}

      <button className="btn-danger" style={{ marginTop: 8 }} onClick={() => onEliminar(fecha)}>Desbloquear este día</button>
      <button className="btn-secondary" onClick={onClose}>Cerrar</button>
    </Modal>
  )
}
