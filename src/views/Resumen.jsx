import * as XLSX from 'xlsx'
import ScreenHeader from '../components/ScreenHeader.jsx'
import { DIAS_FULL, TURNOS } from '../utils/constants'
import { fmt, alumnoColor, initials, todayStr } from '../utils/helpers'

export default function Resumen({ data, onAbrirBackup, showToast }) {
  const hoy = new Date(), mes = hoy.getMonth(), anyo = hoy.getFullYear()
  const cobradoMes = data.pagos.filter(p => { const f = new Date(p.fecha + 'T12:00:00'); return p.tipo === 'recibido' && f.getMonth() === mes && f.getFullYear() === anyo }).reduce((s, p) => s + p.importe, 0)
  const pendienteTotal = data.pagos.filter(p => p.tipo === 'pendiente').reduce((s, p) => s + p.importe, 0)
  const totalSes = data.sesiones.length
  const pres = data.sesiones.filter(s => s.estado === 'presente').length
  const mesLabel = hoy.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })

  const mesesSet = new Set([`${anyo}-${String(mes + 1).padStart(2, '0')}`])
  data.pagos.forEach(p => { const f = new Date(p.fecha + 'T12:00:00'); mesesSet.add(`${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}`) })

  function exportExcel() {
    if (!data.alumnos.length) { showToast('No hay datos para exportar'); return }
    const wb = XLSX.utils.book_new()
    const ws1 = XLSX.utils.json_to_sheet(data.alumnos.map(a => ({
      'Nombre': a.nombre, 'Curso': a.curso || '', 'Materia': a.materia || '', 'Estado': a.estado || 'activo',
      'Fecha alta': a.alta || '', 'Días': (a.dias || []).map(x => DIAS_FULL[parseInt(x)]).join(', '),
      'Turno': TURNOS[a.hora] || a.hora || '', 'Modalidad': a.modalidad === 'fija' ? 'Mensual' : 'Por sesión',
      'Tarifa (€)': a.modalidad === 'fija' ? a.tarifa : a.precioSesion
    })))
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
    data.pagos.forEach(p => { const f = new Date(p.fecha + 'T12:00:00'); mS.add(`${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}`) })
    const rR = [...mS].sort().map(mk => {
      const [ay, am] = mk.split('-').map(Number)
      const cob = data.pagos.filter(p => { const f = new Date(p.fecha + 'T12:00:00'); return p.tipo === 'recibido' && f.getMonth() === am - 1 && f.getFullYear() === ay }).reduce((s, p) => s + p.importe, 0)
      const pen = data.pagos.filter(p => { const f = new Date(p.fecha + 'T12:00:00'); return p.tipo === 'pendiente' && f.getMonth() === am - 1 && f.getFullYear() === ay }).reduce((s, p) => s + p.importe, 0)
      return { 'Mes': new Date(ay, am - 1, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }), 'Cobrado (€)': cob, 'Pendiente (€)': pen, 'Balance (€)': cob - pen }
    })
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rR.length ? rR : [{ 'Mes': 'Sin datos', 'Cobrado (€)': 0, 'Pendiente (€)': 0, 'Balance (€)': 0 }]), 'Resumen mensual')

    XLSX.writeFile(wb, `AvrentoHub_${todayStr()}.xlsx`)
    showToast('Excel exportado')
  }

  return (
    <div className="section-pad">
      <ScreenHeader title="Resumen" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
        <button onClick={exportExcel} style={{ padding: 10, borderRadius: 12, border: '1px solid rgba(77,159,255,0.25)', background: 'rgba(77,159,255,0.08)', color: '#4d9fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Exportar Excel
        </button>
        <button onClick={onAbrirBackup} style={{ padding: 10, borderRadius: 12, border: '1px solid rgba(124,58,237,0.25)', background: 'rgba(124,58,237,0.08)', color: '#a78bfa', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
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
        const cob = data.pagos.filter(p => { const f = new Date(p.fecha + 'T12:00:00'); return p.tipo === 'recibido' && f.getMonth() === am - 1 && f.getFullYear() === ay }).reduce((s, p) => s + p.importe, 0)
        const pen = data.pagos.filter(p => { const f = new Date(p.fecha + 'T12:00:00'); return p.tipo === 'pendiente' && f.getMonth() === am - 1 && f.getFullYear() === ay }).reduce((s, p) => s + p.importe, 0)
        return (
          <div className="card" key={mk} style={esA ? { borderColor: 'rgba(77,159,255,0.3)', background: 'rgba(37,99,235,0.08)' } : undefined}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', textTransform: 'capitalize' }}>
              {label}{esA ? <span style={{ fontSize: 10, background: 'rgba(77,159,255,0.2)', color: '#4d9fff', padding: '1px 6px', borderRadius: 10, marginLeft: 4 }}>Actual</span> : null}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 4, fontSize: 12 }}>
              <span style={{ color: '#34d399', fontWeight: 700 }}>{fmt(cob)}</span>
              {pen > 0 ? <span style={{ color: '#f87171', fontWeight: 700 }}>{fmt(pen)} pend.</span> : null}
            </div>
          </div>
        )
      })}

      <div className="sec-label" style={{ marginTop: 8 }}>Por alumno (este mes)</div>
      {data.alumnos.length ? data.alumnos.map((a, idx) => {
        const ses = data.sesiones.filter(s => s.alumnoId === a.id)
        const presA = ses.filter(s => s.estado === 'presente').length
        const cobA = data.pagos.filter(p => { const f = new Date(p.fecha + 'T12:00:00'); return p.alumnoId === a.id && p.tipo === 'recibido' && f.getMonth() === mes && f.getFullYear() === anyo }).reduce((s, p) => s + p.importe, 0)
        const pendA = data.pagos.filter(p => p.alumnoId === a.id && p.tipo === 'pendiente').reduce((s, p) => s + p.importe, 0)
        return (
          <div className="card" key={a.id}>
            <div className="card-row" style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="avatar" style={{ width: 30, height: 30, fontSize: 11, borderRadius: 8, background: alumnoColor(idx) }}>{initials(a.nombre)}</div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{a.nombre}</span>
              </div>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>{presA}/{ses.length} ses.</span>
            </div>
            <div style={{ display: 'flex', gap: 10, fontSize: 12 }}>
              <span style={{ color: '#34d399', fontWeight: 700 }}>{fmt(cobA)} cobrado</span>
              {pendA > 0 ? <span style={{ color: '#f87171', fontWeight: 700 }}>{fmt(pendA)} pend.</span> : null}
            </div>
          </div>
        )
      }) : <p className="empty">Sin datos aún</p>}
    </div>
  )
}
