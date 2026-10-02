import { useState, useEffect } from 'react'
import Modal from '../Modal.jsx'
import { BACKUP_SK, AUTO_BACKUP_SK } from '../../utils/constants'
import { descargarBackup } from '../../utils/backup'

export default function BackupModal({ open, data, onClose, onRestaurar, showToast }) {
  const [ultimo, setUltimo] = useState('')
  const [autoOn, setAutoOn] = useState(true)

  useEffect(() => {
    if (open) {
      const u = localStorage.getItem(BACKUP_SK)
      setUltimo(u ? 'Último backup: ' + new Date(u).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Aún no has creado ningún backup')
      setAutoOn(localStorage.getItem(AUTO_BACKUP_SK) !== 'off')
    }
  }, [open])

  function exportBackup() {
    descargarBackup(data)
    localStorage.setItem(BACKUP_SK, new Date().toISOString())
    setUltimo('Último backup: ahora mismo')
    showToast('Backup descargado')
  }

  function toggleAuto() {
    const nuevo = !autoOn
    setAutoOn(nuevo)
    localStorage.setItem(AUTO_BACKUP_SK, nuevo ? 'on' : 'off')
  }

  function importBackup(e) {
    const file = e.target.files[0]
    if (!file) return
    const r = new FileReader()
    r.onload = ev => {
      try {
        const b = JSON.parse(ev.target.result)
        if (!b.app || b.app !== 'AvrentoHub' || !b.data) { showToast('Archivo no válido'); return }
        if (!confirm(`¿Restaurar backup del ${new Date(b.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}?`)) return
        onRestaurar(b.data, b.extra)
        onClose()
        showToast(b.extra ? 'Datos, festivos y plantillas restaurados' : 'Datos restaurados (backup antiguo, sin festivos ni plantillas)')
      } catch {
        showToast('Error al leer el archivo')
      }
    }
    r.readAsText(file)
    e.target.value = ''
  }

  return (
    <Modal open={open}>
      <div className="modal-head modal-head-tight">
        <div className="modal-ico ico-azul">🔒</div>
        <div className="modal-head-title">Copia de seguridad</div>
      </div>
      <div className="modal-desc">Guarda tus datos para restaurarlos si la app pierde la información.</div>
      <button className="btn-primary mt-0" onClick={exportBackup}>⬇ Descargar backup JSON</button>
      <div className="backup-ultimo">{ultimo}</div>

      <div className="divisor"></div>

      <div className="ajuste-row">
        <div>
          <div className="txt-titulo">Backup automático al abrir</div>
          <div className="ajuste-desc">Descarga un .json a Descargas, como máximo 1 vez al día</div>
        </div>
        <button onClick={toggleAuto} className={'switch' + (autoOn ? ' on' : '')}>
          <span className="switch-knob"></span>
        </button>
      </div>

      <div className="divisor"></div>
      <div className="subtitulo-caps">Restaurar copia</div>
      <label className="btn-archivo">
        📂 Seleccionar archivo backup
        <input type="file" accept=".json" onChange={importBackup} />
      </label>
      <button className="btn-secondary" onClick={onClose}>Cerrar</button>
    </Modal>
  )
}
