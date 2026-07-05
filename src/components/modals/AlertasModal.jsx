import Modal from '../Modal.jsx'
import { fmt } from '../../utils/helpers'

export default function AlertasModal({ open, alertas, onClose }) {
  return (
    <Modal open={open}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(251,191,36,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⚠️</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Alertas de pago</div>
      </div>

      {alertas.map((al, i) => al.tipo === 'mensual' ? (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'rgba(251,191,36,0.08)', borderRadius: 12, marginBottom: 8, borderLeft: '3px solid #fbbf24' }}>
          <div style={{ fontSize: 20 }}>📅</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{al.nombre}</div>
            <div style={{ fontSize: 12, color: '#fbbf24', fontWeight: 700, marginTop: 2 }}>Mensualidad sin cobrar · {fmt(al.tarifa)}</div>
          </div>
        </div>
      ) : (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'rgba(248,113,113,0.08)', borderRadius: 12, marginBottom: 8, borderLeft: '3px solid #f87171' }}>
          <div style={{ fontSize: 20 }}>📋</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{al.nombre}</div>
            <div style={{ fontSize: 12, color: '#f87171', fontWeight: 700, marginTop: 2 }}>{al.pendientes} sesión{al.pendientes > 1 ? 'es' : ''} sin cobrar · {fmt(al.pendientes * al.precioSesion)}</div>
          </div>
        </div>
      ))}

      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textAlign: 'center', marginTop: 4, marginBottom: 8 }}>
        {alertas.length} alumno{alertas.length > 1 ? 's' : ''} con pagos pendientes
      </div>

      <button className="btn-secondary" onClick={onClose}>Entendido</button>
    </Modal>
  )
}
