import { todayStr } from './helpers'
import { FES_SK, WA_SK, WA_CONFIRM_SK } from './constants'

// Lee una clave de localStorage de forma segura (JSON o texto plano).
function leer(clave, json) {
  try {
    const v = localStorage.getItem(clave)
    if (v == null) return null
    return json ? JSON.parse(v) : v
  } catch {
    return null
  }
}

// El backup incluye, además de alumnos/sesiones/pagos/tareas/eventos ("data"),
// los ajustes que se guardan en claves aparte: festivos y plantillas de WhatsApp.
export function descargarBackup(data) {
  const b = {
    version: 2,
    fecha: new Date().toISOString(),
    app: 'AvrentoHub',
    data,
    extra: {
      festivos: leer(FES_SK, true) || [],
      plantillasWA: leer(WA_SK, true),
      plantillaConfirmacion: leer(WA_CONFIRM_SK, false)
    }
  }
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

// Restaura las plantillas de WhatsApp guardadas en el backup (si las trae).
// Los backups antiguos (version 1) no tienen "extra": en ese caso no se toca nada.
export function restaurarPlantillas(extra) {
  if (!extra) return
  try {
    if (extra.plantillasWA) localStorage.setItem(WA_SK, JSON.stringify(extra.plantillasWA))
    if (extra.plantillaConfirmacion) localStorage.setItem(WA_CONFIRM_SK, extra.plantillaConfirmacion)
  } catch {}
}
