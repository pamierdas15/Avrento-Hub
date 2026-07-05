import { useState, useEffect } from 'react'
import Modal from '../Modal.jsx'
import { BACKUP_SK } from '../../utils/constants'
import { todayStr } from '../../utils/helpers'

export default function BackupModal({ open, data, onClose, onRestaurar, showToast }) {
  const [ultimo, setUltimo] = useState('')

  useEffect(() => {
    if (open) {
      const u = localStorage.getItem(BACKUP_SK)
      setUltimo(u ? 'Último backup: ' + new Date(u).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Aún no has creado ningún backup')
    }
  }, [open])

  function exportBackup() {
    const b = { version: 1, fecha: new Date().toISOString(), app: 'AvrentoHub', data }
    const blob = new Blob([JSON.stringify(b, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `AvrentoHub_backup_${todayStr()}.json`
    a.click()
    URL.revokeObjectURL(url)
    localStorage.setItem(BACKUP_SK, new Date().toISOString())
    setUltimo('Último backup: ahora mismo')
    showToast('Backup descargado')
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
      <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Restaurar copia</div>
      <label style={{ display: 'block', width: '100%', padding: 11, borderRadius: 14, border: '1px solid rgba(77,159,255,0.4)', color: '#4d9fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', textAlign: 'center' }}>
        📂 Seleccionar archivo backup
        <input type="file" accept=".json" onChange={importBackup} style={{ display: 'none' }} />
      </label>
      <button className="btn-secondary" onClick={onClose}>Cerrar</button>
    </Modal>
  )
}
