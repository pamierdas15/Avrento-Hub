import { fmt } from './helpers'

// Alumnos con pagos pendientes (mensualidad no cobrada tras el día 5, o sesiones sueltas sin cobrar)
export function getAlertas(d) {
  const hoy = new Date()
  const dia = hoy.getDate(), mes = hoy.getMonth(), anyo = hoy.getFullYear()
  const res = []
  d.alumnos.forEach(a => {
    if (a.estado === 'baja') return
    if (a.modalidad === 'fija') {
      if (dia <= 5) return
      const ok = d.pagos.some(p => {
        const f = new Date(p.fecha + 'T12:00:00')
        return p.alumnoId === a.id && p.tipo === 'recibido' && f.getMonth() === mes && f.getFullYear() === anyo
      })
      if (!ok) res.push({ tipo: 'mensual', nombre: a.nombre, tarifa: a.tarifa })
    } else {
      const ses = d.sesiones.filter(s => s.alumnoId === a.id && s.estado === 'presente').length
      const total = d.pagos.filter(p => p.alumnoId === a.id && p.tipo === 'recibido').reduce((s, p) => s + p.importe, 0)
      const pag = a.precioSesion > 0 ? Math.floor(total / a.precioSesion) : 0
      const pend = ses - pag
      if (pend > 0) res.push({ tipo: 'sesion', nombre: a.nombre, pendientes: pend, precioSesion: a.precioSesion || 0 })
    }
  })
  return res
}

// Importe pendiente formateado para un alumno concreto (usado en WhatsApp / info de pago)
export function getPendienteFmt(d, alumnoId) {
  const a = d.alumnos.find(x => x.id === alumnoId)
  if (!a) return '0,00 €'
  if (a.modalidad === 'fija') {
    const hoy = new Date(), mes = hoy.getMonth(), anyo = hoy.getFullYear()
    const ok = d.pagos.some(p => {
      const f = new Date(p.fecha + 'T12:00:00')
      return p.alumnoId === alumnoId && p.tipo === 'recibido' && f.getMonth() === mes && f.getFullYear() === anyo
    })
    return ok ? '0,00 €' : fmt(a.tarifa)
  }
  const ses = d.sesiones.filter(s => s.alumnoId === alumnoId && s.estado === 'presente').length
  const total = d.pagos.filter(p => p.alumnoId === alumnoId && p.tipo === 'recibido').reduce((s, p) => s + p.importe, 0)
  const pag = a.precioSesion > 0 ? Math.floor(total / a.precioSesion) : 0
  const pend = ses - pag
  return pend > 0 ? fmt(pend * a.precioSesion) : '0,00 €'
}
