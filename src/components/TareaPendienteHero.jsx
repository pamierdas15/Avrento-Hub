import { useState } from 'react'
import { todayStr } from '../utils/helpers'

export default function TareaPendienteHero({ alumnoId, onGuardar, showToast }) {
  const [open, setOpen] = useState(false)
  const [tarea, setTarea] = useState('')
  const [evento, setEvento] = useState('')
  const [fecha, setFecha] = useState(todayStr())

  function guardar() {
    if (!tarea.trim()) { showToast && showToast('Escribe un título de tarea'); return }
    onGuardar(alumnoId, { tarea: tarea.trim(), evento: evento.trim(), fecha })
    setTarea('')
    setEvento('')
    setFecha(todayStr())
    setOpen(false)
    showToast && showToast('Tarea registrada')
  }

  return (
    <div className="mini-hero">
      <div className="mini-hero-label mini-hero-toggle" onClick={() => setOpen(o => !o)}>
        <span>📝 Tareas Pendientes</span>
        <span style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>▾</span>
      </div>

      {open ? (
        <div style={{ marginTop: 8 }}>
          <div className="inp-row">
            <label className="inp-label">Tarea</label>
            <input type="text" placeholder="Título de la tarea" value={tarea} onChange={e => setTarea(e.target.value)} />
          </div>
          <div className="inp-row">
            <label className="inp-label">Evento</label>
            <textarea rows={2} placeholder="Describe la tarea..." value={evento} onChange={e => setEvento(e.target.value)} />
          </div>
          <div className="inp-row">
            <label className="inp-label">Fecha</label>
            <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} />
          </div>
          <button className="btn-primary" onClick={guardar}>Guardar tarea</button>
        </div>
      ) : null}
    </div>
  )
}
