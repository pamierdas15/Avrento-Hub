import { useState, useEffect } from 'react'
import Modal from '../Modal.jsx'
import { WA_CONFIRM_SK, WA_CONFIRM_DEFAULT } from '../../utils/constants'
import { getUltimoPagoRecibido, formatoMensualidadPago } from '../../utils/business'
import { fmt } from '../../utils/helpers'

function loadPlantilla() {
  try {
    return localStorage.getItem(WA_CONFIRM_SK) || WA_CONFIRM_DEFAULT
  } catch {
    return WA_CONFIRM_DEFAULT
  }
}

// Mismo funcionamiento que WhatsappModal (recordatorio de pago), pero para
// confirmar al alumno que su pago ya se ha recibido correctamente. Se rellena
// con el último pago "cobrado" registrado para el alumno seleccionado.
export default function ConfirmacionPagoModal({ open, data, alumnoId, onClose, showToast }) {
  const { alumnos } = data
  const [selId, setSelId] = useState('')
  const [plantilla, setPlantilla] = useState(WA_CONFIRM_DEFAULT)

  useEffect(() => {
    if (open) {
      setSelId(alumnoId || alumnos[0]?.id || '')
      setPlantilla(loadPlantilla())
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const alumno = alumnos.find(a => a.id === selId)
  const ultimoPago = alumno ? getUltimoPagoRecibido(data, selId) : null
  const mensualidad = formatoMensualidadPago(ultimoPago)

  const preview = alumno
    ? plantilla
        .replace(/{nombre}/g, alumno.nombre)
        .replace(/{importe}/g, ultimoPago ? (+ultimoPago.importe).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00')
        .replace(/{mensualidad}/g, mensualidad || 'su pago')
    : '—'

  function guardarPlantilla() {
    if (!plantilla.trim()) { showToast('La plantilla no puede estar vacía'); return }
    localStorage.setItem(WA_CONFIRM_SK, plantilla)
    showToast('Plantilla guardada')
  }

  function enviar() {
    if (!selId) { showToast('Selecciona un alumno'); return }
    if (!ultimoPago) { showToast('Este alumno no tiene pagos cobrados registrados'); return }
    localStorage.setItem(WA_CONFIRM_SK, plantilla)
    window.open('https://wa.me/?text=' + encodeURIComponent(preview), '_blank')
    onClose()
  }

  return (
    <Modal open={open}>
      <div className="modal-head">
        <div className="modal-ico ico-verde">✅</div>
        <div className="modal-head-title">Confirmación de pago</div>
      </div>

      <div className="inp-row">
        <label className="inp-label">Alumno</label>
        <select value={selId} onChange={e => setSelId(e.target.value)}>
          {alumnos.map(a => <option value={a.id} key={a.id}>{a.nombre}</option>)}
        </select>
      </div>

      {alumno && !ultimoPago ? (
        <div className="aviso-ambar">⚠ Este alumno no tiene ningún pago cobrado registrado todavía.</div>
      ) : null}

      {ultimoPago ? (
        <div className="card card-pago-ok">
          <div className="txt-mini">Último pago cobrado</div>
          <div className="txt-titulo mt-2">{fmt(ultimoPago.importe)} · {mensualidad}</div>
        </div>
      ) : null}

      <div className="inp-row">
        <label className="inp-label">Plantilla <span className="inp-label-hint">(usa {'{nombre}'}, {'{importe}'} y {'{mensualidad}'})</span></label>
        <textarea className="plantilla-txt" value={plantilla} onChange={e => setPlantilla(e.target.value)}></textarea>
      </div>

      <div className="preview-box">
        <div className="preview-label">Vista previa</div>
        <div className="preview-txt">{preview}</div>
      </div>

      <button onClick={enviar} className="btn-whatsapp">📲 Abrir WhatsApp</button>
      <button className="btn-secondary" onClick={guardarPlantilla}>💾 Guardar plantilla</button>
      <button className="btn-secondary btn-neutro" onClick={onClose}>Cancelar</button>
    </Modal>
  )
}
