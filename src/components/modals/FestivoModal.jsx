import { useState, useEffect } from 'react'
import Modal from '../Modal.jsx'
import { FTIPO_BTN_CFG, TURNOS } from '../../utils/constants'
import { todayStr, initials, alumnoColor } from '../../utils/helpers'

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
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(251,191,36,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📅</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Bloquear día</div>
      </div>

      <div className="inp-row">
        <label className="inp-label">Fecha</label>
        <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} />
      </div>

      <div className="inp-row">
        <label className="inp-label">Tipo</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
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
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>⚠ {afectados.length} alumno{afectados.length > 1 ? 's' : ''} con clase ese día</div>
          {afectados.map(a => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: 'rgba(251,191,36,0.06)', borderRadius: 10, marginBottom: 6 }}>
              <div className="avatar" style={{ width: 28, height: 28, fontSize: 10, borderRadius: 8, background: alumnoColor(data.alumnos.indexOf(a)) }}>{initials(a.nombre)}</div>
              <span style={{ fontSize: 13, color: '#fff' }}>{a.nombre}</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginLeft: 'auto' }}>{TURNOS[a.hora] || a.hora || ''}</span>
            </div>
          ))}
        </div>
      ) : null}

      <button className="btn-primary" onClick={guardar} style={{ background: 'linear-gradient(135deg,#92400e,#d97706)', marginTop: 0 }}>Bloquear día</button>
      <button className="btn-secondary" onClick={onClose}>Cancelar</button>
    </Modal>
  )
}
