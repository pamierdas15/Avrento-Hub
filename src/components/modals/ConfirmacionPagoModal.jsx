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
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(37,211,102,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>✅</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Confirmación de pago</div>
      </div>

      <div className="inp-row">
        <label className="inp-label">Alumno</label>
        <select value={selId} onChange={e => setSelId(e.target.value)}>
          {alumnos.map(a => <option value={a.id} key={a.id}>{a.nombre}</option>)}
        </select>
      </div>

      {alumno && !ultimoPago ? (
        <div style={{ fontSize: 11.5, color: '#fbbf24', marginBottom: 10 }}>⚠ Este alumno no tiene ningún pago cobrado registrado todavía.</div>
      ) : null}

      {ultimoPago ? (
        <div className="card" style={{ padding: '10px 12px', marginBottom: 10, background: 'rgba(37,211,102,0.07)', borderColor: 'rgba(37,211,102,0.2)' }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Último pago cobrado</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginTop: 2 }}>{fmt(ultimoPago.importe)} · {mensualidad}</div>
        </div>
      ) : null}

      <div className="inp-row">
        <label className="inp-label">Plantilla <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>(usa {'{nombre}'}, {'{importe}'} y {'{mensualidad}'})</span></label>
        <textarea style={{ height: 100, fontSize: 13 }} value={plantilla} onChange={e => setPlantilla(e.target.value)}></textarea>
      </div>

      <div style={{ background: 'rgba(37,211,102,0.06)', border: '1px solid rgba(37,211,102,0.15)', borderRadius: 12, padding: 12, marginBottom: 12 }}>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Vista previa</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{preview}</div>
      </div>

      <button onClick={enviar} style={{ width: '100%', padding: 12, borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#128c3e,#25d366)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 0 }}>📲 Abrir WhatsApp</button>
      <button className="btn-secondary" onClick={guardarPlantilla}>💾 Guardar plantilla</button>
      <button className="btn-secondary" onClick={onClose} style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)' }}>Cancelar</button>
    </Modal>
  )
}
