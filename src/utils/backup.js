import { todayStr } from './helpers'

export function descargarBackup(data) {
  const b = { version: 1, fecha: new Date().toISOString(), app: 'AvrentoHub', data }
  const blob = new Blob([JSON.stringify(b, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `AvrentoHub_backup_${todayStr()}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
