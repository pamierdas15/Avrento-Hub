import { DIAS_FULL, TURNOS, MODALIDAD_CFG } from '../utils/constants'
import { fmt, alumnoColor, initials, todayStr } from '../utils/helpers'
import { getResumenPendiente } from '../utils/business'

// Clave de mes ("YYYY-MM") a la que se acumula un pago: si el pago es de un
// alumno mensual, el mes que el propio pago indica como "correspondiente"
// (puede diferir de la fecha real en que se cobró); el resto, por su fecha.
function mesClaveDePago(p) {
  if (p.mesCorrespondiente) return p.mesCorrespondiente
  const f = new Date(p.fecha + 'T12:00:00')
  return `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}`
}

export default function Resumen({ data, onAbrirBackup, showToast }) {
  const hoy = new Date(), mes = hoy.getMonth(), anyo = hoy.getFullYear()
  const cobradoMes = data.pagos.filter(p => { const f = new Date(p.fecha + 'T12:00:00'); return p.tipo === 'recibido' && f.getMonth() === mes && f.getFullYear() === anyo }).reduce((s, p) => s + p.importe, 0)
  // Todo lo que falta por cobrar, calculado igual que en Pagos y en las alertas:
  // mensualidades, packs, sesiones y clases extra pendientes de cada alumno.
  const pendienteAlumno = a => getResumenPendiente(data, a).importe
  const pendienteTotal = data.alumnos.reduce((s, a) => s + pendienteAlumno(a), 0)
  const totalSes = data.sesiones.length
  const pres = data.sesiones.filter(s => s.estado === 'presente').length
  const mesLabel = hoy.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })

  const mesesSet = new Set([`${anyo}-${String(mes + 1).padStart(2, '0')}`])
  data.pagos.forEach(p => mesesSet.add(mesClaveDePago(p)))

  // La librería de Excel es grande (más de la mitad de la app), así que solo
  // se descarga al pulsar "Exportar Excel" y no ralentiza el arranque.
  async function exportExcel() {
    if (!data.alumnos.length) { showToast('No hay datos para exportar'); return }
    let XLSX
    try {
      XLSX = await import('xlsx')
    } catch {
      showToast('Sin conexión: no se pudo cargar el exportador')
      return
    }
    const wb = XLSX.utils.book_new()
    const ws1 = XLSX.utils.json_to_sheet(data.alumnos.map(a => {
      const modCfg = MODALIDAD_CFG[a.modalidad || 'fija']
      return {
        'Nombre': a.nombre, 'Curso': a.curso || '', 'Materia': a.materia || '', 'Estado': a.estado || 'activo',
        'Fecha alta': a.alta || '', 'Días': (a.dias || []).map(x => DIAS_FULL[parseInt(x)]).join(', '),
        'Turno': TURNOS[a.hora] || a.hora || '', 'Modalidad': modCfg.selectLabel,
        'Tarifa (€)': a[modCfg.campo]
      }
    }))
    XLSX.utils.book_append_sheet(wb, ws1, 'Alumnos')

    const asR = data.sesiones.slice().sort((a, b) => a.fecha.localeCompare(b.fecha)).map(s => {
      const al = data.alumnos.find(a => a.id === s.alumnoId)
      return { 'Alumno': al ? al.nombre : '?', 'Curso': al ? al.curso || '' : '', 'Fecha': s.fecha, 'Estado': s.estado }
    })
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(asR.length ? asR : [{ 'Alumno': 'Sin datos', 'Fecha': '', 'Estado': '' }]), 'Asistencia')

    const paR = data.pagos.slice().sort((a, b) => a.fecha.localeCompare(b.fecha)).map(p => {
      const al = data.alumnos.find(a => a.id === p.alumnoId)
      return { 'Alumno': al ? al.nombre : '?', 'Fecha': p.fecha, 'Concepto': p.concepto, 'Tipo': p.tipo === 'recibido' ? 'Cobrado' : 'Pendiente', 'Importe (€)': p.tipo === 'recibido' ? p.importe : -p.importe }
    })
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(paR.length ? paR : [{ 'Alumno': 'Sin datos', 'Fecha': '', 'Concepto': '', 'Tipo': '', 'Importe (€)': 0 }]), 'Pagos')

    const mS = new Set()
    data.pagos.forEach(p => mS.add(mesClaveDePago(p)))
    const rR = [...mS].sort().map(mk => {
      const [ay, am] = mk.split('-').map(Number)
      const cob = data.pagos.filter(p => p.tipo === 'recibido' && mesClaveDePago(p) === mk).reduce((s, p) => s + p.importe, 0)
      const pen = data.pagos.filter(p => p.tipo === 'pendiente' && mesClaveDePago(p) === mk).reduce((s, p) => s + p.importe, 0)
      return { 'Mes': new Date(ay, am - 1, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }), 'Cobrado (€)': cob, 'Pendiente (€)': pen, 'Balance (€)': cob - pen }
    })
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rR.length ? rR : [{ 'Mes': 'Sin datos', 'Cobrado (€)': 0, 'Pendiente (€)': 0, 'Balance (€)': 0 }]), 'Resumen mensual')

    XLSX.writeFile(wb, `AvrentoHub_${todayStr()}.xlsx`)
    showToast('Excel exportado')
  }

  return (
    <div className="section-pad">
      <div className="acciones-2">
        <button onClick={exportExcel} className="accion-btn accion-azul">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Exportar Excel
        </button>
        <button onClick={onAbrirBackup} className="accion-btn accion-morado">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>Backup
        </button>
      </div>

      <div className="resumen-hero"><div className="label">Cobrado en {mesLabel}</div><div className="val">{fmt(cobradoMes)}</div></div>

      <div className="resumen-grid">
        <div className="rcard"><div className="rl">Pendiente total</div><div className="rv red">{fmt(pendienteTotal)}</div></div>
        <div className="rcard"><div className="rl">Alumnos</div><div className="rv purple">{data.alumnos.length}</div></div>
        <div className="rcard"><div className="rl">Sesiones</div><div className="rv purple">{totalSes}</div></div>
        <div className="rcard"><div className="rl">Asistencia</div><div className="rv green">{totalSes ? Math.round(pres / totalSes * 100) : 0}%</div></div>
      </div>

      <div className="sec-label">Histórico mensual</div>
      {[...mesesSet].sort((a, b) => b.localeCompare(a)).map(mk => {
        const [ay, am] = mk.split('-').map(Number)
        const esA = am - 1 === mes && ay === anyo
        const label = new Date(ay, am - 1, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
        const cob = data.pagos.filter(p => p.tipo === 'recibido' && mesClaveDePago(p) === mk).reduce((s, p) => s + p.importe, 0)
        const pen = data.pagos.filter(p => p.tipo === 'pendiente' && mesClaveDePago(p) === mk).reduce((s, p) => s + p.importe, 0)
        return (
          <div className={'card' + (esA ? ' mes-actual' : '')} key={mk}>
            <div className="txt-titulo txt-cap">
              {label}{esA ? <span className="tag-actual">Actual</span> : null}
            </div>
            <div className="importes-row mt-4">
              <span className="txt-cobrado">{fmt(cob)}</span>
              {pen > 0 ? <span className="txt-pend">{fmt(pen)} pend.</span> : null}
            </div>
          </div>
        )
      })}

      <div className="sec-label mt-8">Por alumno (este mes)</div>
      {data.alumnos.length ? data.alumnos.map((a, idx) => {
        const ses = data.sesiones.filter(s => s.alumnoId === a.id)
        const presA = ses.filter(s => s.estado === 'presente').length
        const cobA = data.pagos.filter(p => { const f = new Date(p.fecha + 'T12:00:00'); return p.alumnoId === a.id && p.tipo === 'recibido' && f.getMonth() === mes && f.getFullYear() === anyo }).reduce((s, p) => s + p.importe, 0)
        const pendA = pendienteAlumno(a)
        return (
          <div className="card" key={a.id}>
            <div className="card-row card-row-mb">
              <div className="fila-alumno">
                <div className="avatar avatar-30" style={{ background: alumnoColor(idx) }}>{initials(a.nombre)}</div>
                <span className="txt-titulo">{a.nombre}</span>
              </div>
              <span className="txt-tenue">{presA}/{ses.length} ses.</span>
            </div>
            <div className="importes-row">
              <span className="txt-cobrado">{fmt(cobA)} cobrado</span>
              {pendA > 0 ? <span className="txt-pend">{fmt(pendA)} pend.</span> : null}
            </div>
          </div>
        )
      }) : <p className="empty">Sin datos aún</p>}
    </div>
  )
}
