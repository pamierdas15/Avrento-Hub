import { useState } from 'react'
import { todayStr } from '../utils/helpers'

// Misma mecánica que TareaPendienteHero: registra un elemento con título,
// descripción y fecha, pero para eventos próximos en vez de tareas pendientes.
export default function EventoProximoHero({ alumnoId, onGuardar, showToast }) {
  const [open, setOpen] = useState(false)
  const [tarea, setTarea] = useState('')
  const [evento, setEvento] = useState('')
  const [fecha, setFecha] = useState(todayStr())

  function guardar() {
    if (!tarea.trim()) { showToast && showToast('Escribe un título de evento'); return }
    onGuardar(alumnoId, { tarea: tarea.trim(), evento: evento.trim(), fecha })
    setTarea('')
    setEvento('')
    setFecha(todayStr())
    setOpen(false)
    showToast && showToast('Evento registrado')
  }

  return (
    <div className="mini-hero">
      <div className="mini-hero-label mini-hero-toggle" onClick={() => setOpen(o => !o)}>
        <span>📅 Eventos Próximos</span>
        <span className={'rot' + (open ? ' is-open' : '')}>▾</span>
      </div>

      {open ? (
        <div className="mini-hero-body">
          <div className="inp-row">
            <label className="inp-label">Evento</label>
            <input type="text" placeholder="Título del evento" value={tarea} onChange={e => setTarea(e.target.value)} />
          </div>
          <div className="inp-row">
            <label className="inp-label">Descripción</label>
            <textarea rows={2} placeholder="Describe el evento..." value={evento} onChange={e => setEvento(e.target.value)} />
          </div>
          <div className="inp-row">
            <label className="inp-label">Fecha</label>
            <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} />
          </div>
          <button className="btn-primary" onClick={guardar}>Guardar evento</button>
        </div>
      ) : null}
    </div>
  )
}
