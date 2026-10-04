import { useState, useEffect } from 'react'
import Modal from '../Modal.jsx'
import { FTIPO_BTN_CFG } from '../../utils/constants'
import { todayStr, initials, alumnoColor, etiquetaTurno } from '../../utils/helpers'

const TIPOS = [
  { v: 'festivo', label: '🎉 Festivo' },
  { v: 'vacaciones', label: '🏖 Vacaciones' },
  { v: 'ausencia', label: '🤒 Ausencia' }
]

export default function FestivoModal({ open, data, onClose, onGuardar, showToast }) {
  const [fecha, setFecha] = useState(todayStr())
  const [tipo, setTipo] = useState('festivo')
  const [nota, setNota] = useState('')

  useEffect(() => {
    if (open) { setFecha(todayStr()); setTipo('festivo'); setNota('') }
  }, [open])

  const dia = fecha ? new Date(fecha + 'T12:00:00').getDay() : null
  const afectados = dia === null ? [] : data.alumnos.filter(a => (a.dias || []).includes(String(dia)))

  function guardar() {
    if (!fecha) { showToast('Selecciona una fecha'); return }
    onGuardar({ fecha, tipo, nota: nota.trim() })
  }

  return (
    <Modal open={open}>
      <div className="modal-head">
        <div className="modal-ico ico-ambar">📅</div>
        <div className="modal-head-title">Bloquear día</div>
      </div>

      <div className="inp-row">
        <label className="inp-label">Fecha</label>
        <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} />
      </div>

      <div className="inp-row">
        <label className="inp-label">Tipo</label>
        <div className="fila-tipos">
          {TIPOS.map(o => {
            const on = tipo === o.v
            const c = FTIPO_BTN_CFG[o.v]
            return (
              <button type="button" key={o.v} className="ftipo-btn" onClick={() => setTipo(o.v)}
                style={{ background: on ? c.bg : 'rgba(255,255,255,0.05)', color: on ? c.color : 'rgba(255,255,255,0.65)', borderColor: on ? c.border : 'rgba(255,255,255,0.1)' }}>
                {o.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="inp-row">
        <label className="inp-label">Nota (opcional)</label>
        <input type="text" placeholder="Ej: Semana Santa, baja médica..." value={nota} onChange={e => setNota(e.target.value)} />
      </div>

      {afectados.length ? (
        <div className="mb-10">
          <div className="subtitulo-caps">⚠ {afectados.length} alumno{afectados.length > 1 ? 's' : ''} con clase ese día</div>
          {afectados.map(a => (
            <div key={a.id} className="afectado-row ambar">
              <div className="avatar avatar-28" style={{ background: alumnoColor(data.alumnos.indexOf(a)) }}>{initials(a.nombre)}</div>
              <span className="afectado-nombre">{a.nombre}</span>
              <span className="afectado-turno">{etiquetaTurno(a)}</span>
            </div>
          ))}
        </div>
      ) : null}

      <button className="btn-primary btn-ambar" onClick={guardar}>Bloquear día</button>
      <button className="btn-secondary" onClick={onClose}>Cancelar</button>
    </Modal>
  )
}
