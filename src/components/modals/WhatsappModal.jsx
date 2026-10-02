import { useState, useEffect } from 'react'
import Modal from '../Modal.jsx'
import { WA_SK, WA_DEFAULTS } from '../../utils/constants'
import { getResumenPendiente } from '../../utils/business'

function loadPlantillas() {
  try {
    return { ...WA_DEFAULTS, ...JSON.parse(localStorage.getItem(WA_SK)) }
  } catch {
    return { ...WA_DEFAULTS }
  }
}

export default function WhatsappModal({ open, data, onClose, showToast }) {
  const { alumnos } = data
  const [alumnoId, setAlumnoId] = useState('')
  const [plantillas, setPlantillas] = useState(WA_DEFAULTS)
  const [plantilla, setPlantilla] = useState('')

  useEffect(() => {
    if (open) {
      const primero = alumnos[0]?.id || ''
      const p = loadPlantillas()
      setPlantillas(p)
      setAlumnoId(primero)
      const a = alumnos.find(x => x.id === primero)
      setPlantilla(a ? p[a.modalidad || 'fija'] : '')
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const alumno = alumnos.find(a => a.id === alumnoId)
  const modalidad = alumno ? (alumno.modalidad || 'fija') : 'fija'

  function seleccionarAlumno(id) {
    setAlumnoId(id)
    const a = alumnos.find(x => x.id === id)
    if (a) setPlantilla(plantillas[a.modalidad || 'fija'])
  }

  const resumen = alumno ? getResumenPendiente(data, alumno) : { importe: 0, texto: '' }
  const preview = alumno
    ? plantilla
        .replace(/{nombre}/g, alumno.nombre)
        .replace(/{importe}/g, resumen.importe.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €')
        .replace(/{pendientes}/g, resumen.texto || 'sin pagos pendientes')
    : '—'

  function guardarPlantilla() {
    if (!plantilla.trim()) { showToast('La plantilla no puede estar vacía'); return }
    const nuevas = { ...plantillas, [modalidad]: plantilla }
    setPlantillas(nuevas)
    localStorage.setItem(WA_SK, JSON.stringify(nuevas))
    showToast('Plantilla guardada')
  }

  function enviar() {
    if (!alumnoId) { showToast('Selecciona un alumno'); return }
    const nuevas = { ...plantillas, [modalidad]: plantilla }
    localStorage.setItem(WA_SK, JSON.stringify(nuevas))
    window.open('https://wa.me/?text=' + encodeURIComponent(preview), '_blank')
    onClose()
  }

  return (
    <Modal open={open}>
      <div className="modal-head">
        <div className="modal-ico ico-verde">💬</div>
        <div className="modal-head-title">Recordatorio de pago</div>
      </div>

      <div className="inp-row">
        <label className="inp-label">Alumno</label>
        <select value={alumnoId} onChange={e => seleccionarAlumno(e.target.value)}>
          {alumnos.map(a => <option value={a.id} key={a.id}>{a.nombre}</option>)}
        </select>
      </div>

      <div className="inp-row">
        <label className="inp-label">Plantilla <span className="inp-label-hint">(usa {'{nombre}'}, {'{importe}'} y {'{pendientes}'})</span></label>
        <textarea className="plantilla-txt" value={plantilla} onChange={e => setPlantilla(e.target.value)}></textarea>
      </div>

      <div className="preview-box">
        <div className="preview-label">Vista previa</div>
        <div className="preview-txt">{preview}</div>
      </div>

      <button onClick={enviar} className="btn-whatsapp">📲 Abrir WhatsApp</button>
      <button className="btn-secondary" onClick={guardarPlantilla}>💾 Guardar plantilla de esta modalidad</button>
      <button className="btn-secondary btn-neutro" onClick={onClose}>Cancelar</button>
    </Modal>
  )
}
