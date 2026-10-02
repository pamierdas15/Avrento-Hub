import Modal from '../Modal.jsx'
import { todayStr } from '../../utils/helpers'

// Ventana de vistazo rápido que se abre al pulsar un aviso de Inicio.
// tipo: 'pagos' (alertas de pago), 'tareas' (tareas pendientes) o null (cerrada).
export default function AlertasModal({ tipo, alertas, tareas, onClose }) {
  const hoy = todayStr()
  return (
    <Modal open={!!tipo}>
      {tipo === 'tareas' ? (
        <>
          <div className="modal-head">
            <div className="modal-ico ico-morado">📝</div>
            <div className="modal-head-title">Tareas pendientes</div>
          </div>

          {tareas.length ? tareas.map(t => (
            <div key={t.alumnoId + '-' + t.id} className="alerta-item alerta-item-tarea">
              <div className="flex-1 min-w-0">
                <div className="registro-head">
                  <span className="registro-titulo">{t.tarea}</span>
                  {t.fecha ? (
                    <span className={'registro-fecha' + (t.fecha < hoy ? ' vencida' : '')}>
                      {new Date(t.fecha + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    </span>
                  ) : null}
                </div>
                <div className="registro-alumno">{t.alumnoNombre}</div>
                {t.evento ? <div className="detalle-item-desc">{t.evento}</div> : null}
              </div>
            </div>
          )) : <p className="empty">Sin tareas pendientes</p>}

          <div className="alertas-pie">
            {tareas.length} tarea{tareas.length !== 1 ? 's' : ''} pendiente{tareas.length !== 1 ? 's' : ''}
          </div>
        </>
      ) : (
        <>
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
            {alertas.length} alumno{alertas.length !== 1 ? 's' : ''} con pagos pendientes
          </div>
        </>
      )}

      <button className="btn-secondary" onClick={onClose}>Entendido</button>
    </Modal>
  )
}
