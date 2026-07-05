import { useState, useEffect } from 'react'
import ScreenHeader from '../components/ScreenHeader.jsx'
import { todayStr, fmt } from '../utils/helpers'

export default function Pagos({ data, registrarPago, eliminarPago, showToast, onAbrirWhatsapp }) {
  const { alumnos } = data
  const [alumnoId, setAlumnoId] = useState(alumnos[0]?.id || '')
  const [tipo, setTipo] = useState('recibido')
  const [importe, setImporte] = useState('')
  const [concepto, setConcepto] = useState('')
  const [fecha, setFecha] = useState(todayStr())

  const alumno = alumnos.find(a => a.id === alumnoId)

  useEffect(() => {
    if (alumno) setImporte(alumno.modalidad === 'fija' ? String(alumno.tarifa) : String(alumno.precioSesion))
  }, [alumnoId]) // eslint-disable-line react-hooks/exhaustive-deps

  function guardar() {
    const imp = parseFloat(importe)
    if (!alumnoId || !imp || !fecha) { showToast('Rellena todos los campos'); return }
    registrarPago({ alumnoId, importe: +imp.toFixed(2), concepto: concepto.trim() || 'Pago', fecha, tipo })
    setConcepto('')
    showToast('Pago registrado')
  }

  const pagos = data.pagos.filter(p => p.alumnoId === alumnoId).slice().sort((a, b) => b.fecha.localeCompare(a.fecha))

  return (
    <div className="section-pad">
      <ScreenHeader title="Pagos" />
      <div className="inp-row">
        <label className="inp-label">Alumno</label>
        <select value={alumnoId} onChange={e => setAlumnoId(e.target.value)}>
          {alumnos.length
            ? alumnos.map(a => <option value={a.id} key={a.id}>{a.nombre}</option>)
            : <option value="">Sin alumnos</option>}
        </select>
      </div>

      {alumno ? (
        <div style={{ marginBottom: 10 }}>
          <div className="card" style={{ padding: '10px 12px', background: 'rgba(37,99,235,0.1)', borderColor: 'rgba(77,159,255,0.2)' }}>
            <span className={'badge ' + (alumno.modalidad === 'fija' ? 'badge-fija' : 'badge-sesion')}>{alumno.modalidad === 'fija' ? 'Mensual' : 'Por sesión'}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#4d9fff', marginLeft: 8 }}>{alumno.modalidad === 'fija' ? fmt(alumno.tarifa) + ' /mes' : fmt(alumno.precioSesion) + ' /sesión'}</span>
          </div>
        </div>
      ) : null}

      <div className="seg">
        <button className={'seg-btn' + (tipo === 'recibido' ? ' on' : '')} onClick={() => setTipo('recibido')}>✓ Cobrado</button>
        <button className={'seg-btn' + (tipo === 'pendiente' ? ' on' : '')} onClick={() => setTipo('pendiente')}>⏳ Pendiente</button>
      </div>
      <div className="inp-row">
        <label className="inp-label">Importe (€)</label>
        <input type="number" placeholder="0,00" step="0.01" min="0" value={importe} onChange={e => setImporte(e.target.value)} />
      </div>
      <div className="inp-row">
        <label className="inp-label">Concepto</label>
        <input type="text" placeholder="Ej: Mensualidad junio..." value={concepto} onChange={e => setConcepto(e.target.value)} />
      </div>
      <div className="inp-row">
        <label className="inp-label">Fecha</label>
        <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} />
      </div>
      <button className="btn-primary" onClick={guardar}>Registrar pago</button>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '16px 0' }}></div>

      <button onClick={onAbrirWhatsapp} style={{ width: '100%', padding: 11, borderRadius: 14, border: '1px solid rgba(37,211,102,0.3)', background: 'rgba(37,211,102,0.08)', color: '#25d366', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#25d366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        Enviar recordatorio WhatsApp
      </button>

      <div style={{ marginTop: 14 }}>
        {!alumnoId ? null : !pagos.length ? (
          <p className="empty">Sin pagos registrados</p>
        ) : (
          <>
            <div className="sec-label" style={{ marginTop: 4 }}>Historial</div>
            {pagos.map(p => (
              <div className="hist-item" key={p.id}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{p.concepto}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>{new Date(p.fecha + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                </div>
                <span className={'badge ' + (p.tipo === 'recibido' ? 'badge-ok' : 'badge-pend')} style={{ marginRight: 6 }}>{fmt(p.importe)}</span>
                <button className="icon-btn" onClick={() => eliminarPago(p.id)}>✕</button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
