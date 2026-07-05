import { useState, useEffect } from 'react'
import Modal from '../Modal.jsx'
import { WA_SK, WA_DEFAULT } from '../../utils/constants'
import { getPendienteFmt } from '../../utils/business'

export default function WhatsappModal({ open, data, onClose, showToast }) {
  const { alumnos } = data
  const [alumnoId, setAlumnoId] = useState('')
  const [plantilla, setPlantilla] = useState(WA_DEFAULT)

  useEffect(() => {
    if (open) {
      setAlumnoId(alumnos[0]?.id || '')
      setPlantilla(localStorage.getItem(WA_SK) || WA_DEFAULT)
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const alumno = alumnos.find(a => a.id === alumnoId)
  const preview = alumno ? plantilla.replace(/{nombre}/g, alumno.nombre).replace(/{importe}/g, getPendienteFmt(data, alumnoId)) : '—'

  function guardarPlantilla() {
    if (!plantilla.trim()) { showToast('La plantilla no puede estar vacía'); return }
    localStorage.setItem(WA_SK, plantilla)
    showToast('Plantilla guardada')
  }

  function enviar() {
    if (!alumnoId) { showToast('Selecciona un alumno'); return }
    localStorage.setItem(WA_SK, plantilla)
    window.open('https://wa.me/?text=' + encodeURIComponent(preview), '_blank')
    onClose()
  }

  return (
    <Modal open={open}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(37,211,102,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>💬</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Recordatorio de pago</div>
      </div>

      <div className="inp-row">
        <label className="inp-label">Alumno</label>
        <select value={alumnoId} onChange={e => setAlumnoId(e.target.value)}>
          {alumnos.map(a => <option value={a.id} key={a.id}>{a.nombre}</option>)}
        </select>
      </div>

      <div className="inp-row">
        <label className="inp-label">Plantilla <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>(usa {'{nombre}'} e {'{importe}'})</span></label>
        <textarea style={{ height: 90, fontSize: 13 }} value={plantilla} onChange={e => setPlantilla(e.target.value)}></textarea>
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
