import { useState, useEffect } from 'react'
import Modal from '../Modal.jsx'
import { todayStr } from '../../utils/helpers'

// Formulario emergente para registrar una tarea o un evento desde la pestaña
// Alumnos (sin pasar por el perfil del alumno en Inicio). Mismos campos que
// TareaPendienteHero / EventoProximoHero, más la selección del alumno.
const TEXTOS = {
  tarea: {
    titulo: 'Nueva tarea',
    labelTitulo: 'Tarea',
    placeholderTitulo: 'Título de la tarea',
    labelDescripcion: 'Evento',
    placeholderDescripcion: 'Describe la tarea...',
    boton: 'Guardar tarea',
    errorTitulo: 'Escribe un título de tarea',
    toastOk: 'Tarea registrada'
  },
  evento: {
    titulo: 'Nuevo evento',
    labelTitulo: 'Evento',
    placeholderTitulo: 'Título del evento',
    labelDescripcion: 'Descripción',
    placeholderDescripcion: 'Describe el evento...',
    boton: 'Guardar evento',
    errorTitulo: 'Escribe un título de evento',
    toastOk: 'Evento registrado'
  }
}

export default function NuevoRegistroModal({ open, tipo, alumnos, onGuardar, onClose, showToast }) {
  const t = TEXTOS[tipo] || TEXTOS.tarea
  const [alumnoId, setAlumnoId] = useState('')
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [fecha, setFecha] = useState(todayStr())

  useEffect(() => {
    if (open) {
      setAlumnoId(alumnos[0]?.id || '')
      setTitulo('')
      setDescripcion('')
      setFecha(todayStr())
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  function guardar() {
    if (!alumnoId) { showToast('Selecciona un alumno'); return }
    if (!titulo.trim()) { showToast(t.errorTitulo); return }
    onGuardar(alumnoId, { tarea: titulo.trim(), evento: descripcion.trim(), fecha })
    showToast(t.toastOk)
    onClose()
  }

  return (
    <Modal open={open}>
      <div className="modal-title">{t.titulo}</div>

      <div className="inp-row">
        <label className="inp-label">Alumno</label>
        <select value={alumnoId} onChange={e => setAlumnoId(e.target.value)}>
          {alumnos.length
            ? alumnos.map(a => <option value={a.id} key={a.id}>{a.nombre}</option>)
            : <option value="">Sin alumnos</option>}
        </select>
      </div>
      <div className="inp-row">
        <label className="inp-label">{t.labelTitulo}</label>
        <input type="text" placeholder={t.placeholderTitulo} value={titulo} onChange={e => setTitulo(e.target.value)} />
      </div>
      <div className="inp-row">
        <label className="inp-label">{t.labelDescripcion}</label>
        <textarea rows={2} placeholder={t.placeholderDescripcion} value={descripcion} onChange={e => setDescripcion(e.target.value)} />
      </div>
      <div className="inp-row">
        <label className="inp-label">Fecha</label>
        <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} />
      </div>

      <button className="btn-primary" onClick={guardar}>{t.boton}</button>
      <button className="btn-secondary" onClick={onClose}>Cancelar</button>
    </Modal>
  )
}
