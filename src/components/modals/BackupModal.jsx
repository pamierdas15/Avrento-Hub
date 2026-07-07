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
        onRestaurar(b.data)
        onClose()
        showToast('Datos restaurados')
      } catch {
        showToast('Error al leer el archivo')
      }
    }
    r.readAsText(file)
    e.target.value = ''
  }

  return (
    <Modal open={open}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(77,159,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🔒</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Copia de seguridad</div>
      </div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 14 }}>Guarda tus datos para restaurarlos si la app pierde la información.</div>
      <button className="btn-primary" onClick={exportBackup} style={{ marginTop: 0 }}>⬇ Descargar backup JSON</button>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textAlign: 'center', margin: '6px 0 12px' }}>{ultimo}</div>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: 12 }}></div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 2px', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Backup automático al abrir</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>Descarga un .json a Descargas, como máximo 1 vez al día</div>
        </div>
        <button
          onClick={toggleAuto}
          style={{ width: 44, height: 26, borderRadius: 999, border: 'none', flexShrink: 0, cursor: 'pointer', position: 'relative', background: autoOn ? 'linear-gradient(135deg,var(--accent),#2563eb)' : 'rgba(255,255,255,0.12)', transition: 'background 0.2s' }}
        >
          <span style={{ position: 'absolute', top: 3, left: autoOn ? 22 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }}></span>
        </button>
      </div>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: 12 }}></div>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Restaurar copia</div>
      <label style={{ display: 'block', width: '100%', padding: 11, borderRadius: 14, border: '1px solid rgba(77,159,255,0.4)', color: '#4d9fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', textAlign: 'center' }}>
        📂 Seleccionar archivo backup
        <input type="file" accept=".json" onChange={importBackup} style={{ display: 'none' }} />
      </label>
      <button className="btn-secondary" onClick={onClose}>Cerrar</button>
    </Modal>
  )
}
