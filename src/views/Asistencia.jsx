import { useState } from 'react'
import ScreenHeader from '../components/ScreenHeader.jsx'
import { todayStr } from '../utils/helpers'

export default function Asistencia({ data, registrarSesion, eliminarSesion, showToast }) {
  const { alumnos } = data
  const [alumnoId, setAlumnoId] = useState(alumnos[0]?.id || '')
  const [fecha, setFecha] = useState(todayStr())
  const [estado, setEstado] = useState('presente')

  function guardar() {
    if (!alumnoId || !fecha) { showToast('Selecciona alumno y fecha'); return }
    const ok = registrarSesion(alumnoId, fecha, estado)
    showToast(ok ? 'Asistencia registrada' : 'Ya existe un registro para esta fecha')
  }

  const ses = data.sesiones.filter(s => s.alumnoId === alumnoId).slice().sort((a, b) => b.fecha.localeCompare(a.fecha))

  return (
    <div className="section-pad">
      <ScreenHeader title="Asistencia" />
      <div className="inp-row">
        <label className="inp-label">Alumno</label>
        <select value={alumnoId} onChange={e => setAlumnoId(e.target.value)}>
          {alumnos.length
            ? alumnos.map(a => <option value={a.id} key={a.id}>{a.nombre}</option>)
            : <option value="">Sin alumnos</option>}
        </select>
      </div>
      <div className="inp-row">
        <label className="inp-label">Fecha</label>
        <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} />
      </div>
      <div className="seg">
        <button className={'seg-btn' + (estado === 'presente' ? ' on' : '')} onClick={() => setEstado('presente')}>✓ Presente</button>
        <button className={'seg-btn' + (estado === 'ausente' ? ' on' : '')} onClick={() => setEstado('ausente')}>✗ Ausente</button>
        <button className={'seg-btn' + (estado === 'justificada' ? ' on' : '')} onClick={() => setEstado('justificada')}>↩ Just.</button>
      </div>
      <button className="btn-primary" onClick={guardar}>Registrar asistencia</button>

      <div style={{ marginTop: 14 }}>
        {!alumnoId ? null : !ses.length ? (
          <p className="empty">Sin sesiones registradas</p>
        ) : (
          <>
            <div className="sec-label" style={{ marginTop: 4 }}>Historial</div>
            {ses.map(s => (
              <div className="hist-item" key={s.id}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{new Date(s.fecha + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
                </div>
                <span className={'badge badge-' + s.estado}>{s.estado === 'presente' ? '✓ Presente' : s.estado === 'ausente' ? '✗ Ausente' : '↩ Justificada'}</span>
                <button className="icon-btn" onClick={() => eliminarSesion(s.id)}>✕</button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
