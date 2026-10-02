import Modal from '../Modal.jsx'

export default function AlertasModal({ open, alertas, onClose }) {
  return (
    <Modal open={open}>
      <div className="modal-head">
        <div className="modal-ico ico-ambar">⚠️</div>
        <div className="modal-head-title">Alertas de pago</div>
      </div>

      {alertas.map((al, i) => (
        <div key={i} className="alerta-item">
          <div className="alerta-item-ico">⚠️</div>
          <div className="txt-titulo">
            {al.nombre} — {al.count} pago{al.count > 1 ? 's' : ''} pendiente{al.count > 1 ? 's' : ''}
          </div>
        </div>
      ))}

      <div className="alertas-pie">
        {alertas.length} alumno{alertas.length > 1 ? 's' : ''} con pagos pendientes
      </div>

      <button className="btn-secondary" onClick={onClose}>Entendido</button>
    </Modal>
  )
}
