import { useState, useEffect } from 'react'
import Modal from '../Modal.jsx'
import { CURSOS, ESTADO_BTN_CFG, MODALIDAD_CFG } from '../../utils/constants'
import { todayStr } from '../../utils/helpers'

const DIAS_BTNS = [
  { v: '1', t: 'Lun' }, { v: '2', t: 'Mar' }, { v: '3', t: 'Mié' }, { v: '4', t: 'Jue' },
  { v: '5', t: 'Vie' }, { v: '6', t: 'Sáb' }, { v: '0', t: 'Dom' }
]

const CLASES_SEMANALES_OPCIONES = [1, 2, 3, 4, 5, 6]

const BLANK = {
  id: '', nombre: '', curso: '1º ESO', materia: '', estado: 'activo', alta: todayStr(),
  dias: [], hora: '', modalidad: 'fija', tarifa: '', precioPack: '', precioSesion: '',
  clasesSemanales: 0, notas: ''
}

export default function AlumnoModal({ open, editing, onClose, onSave, onDelete, showToast }) {
  const [form, setForm] = useState(BLANK)

  useEffect(() => {
    if (open) setForm(editing ? { ...BLANK, ...editing } : BLANK)
  }, [open, editing])

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }
  function toggleDia(v) {
    setForm(f => ({ ...f, dias: f.dias.includes(v) ? f.dias.filter(x => x !== v) : [...f.dias, v] }))
  }
  function toggleClasesSemanales(n) {
    setForm(f => ({ ...f, clasesSemanales: f.clasesSemanales === n ? 0 : n }))
  }

  function guardar() {
    if (!form.nombre.trim()) { showToast('Introduce el nombre'); return }
    // Al reactivar un alumno pausado/de baja, su fecha de alta se actualiza a
    // hoy: los pagos pendientes se cuentan siempre desde la fecha de alta.
    const reactivando = form.estado === 'activo' && editing && editing.estado !== 'activo'
    const alta = reactivando ? todayStr() : form.alta
    onSave({
      id: form.id || Date.now().toString(),
      nombre: form.nombre.trim(),
      curso: form.curso,
      materia: form.materia.trim(),
      estado: form.estado,
      alta,
      dias: form.dias,
      hora: form.hora,
      modalidad: form.modalidad,
      tarifa: parseFloat(form.tarifa) || 0,
      precioPack: parseFloat(form.precioPack) || 0,
      precioSesion: parseFloat(form.precioSesion) || 0,
      clasesSemanales: form.modalidad === 'fija' ? (parseInt(form.clasesSemanales) || 0) : 0,
      notas: form.notas.trim()
    })
  }

  const modCfg = MODALIDAD_CFG[form.modalidad]

  return (
    <Modal open={open}>
      <div className="modal-title">{editing ? 'Editar alumno' : 'Nuevo alumno'}</div>

      <div className="inp-row">
        <label className="inp-label">Nombre completo</label>
        <input type="text" placeholder="Ej: María García" value={form.nombre} onChange={e => set('nombre', e.target.value)} />
      </div>

      <div className="inp-row">
        <label className="inp-label">Curso</label>
        <select value={form.curso} onChange={e => set('curso', e.target.value)}>
          {CURSOS.map(grp => (
            <optgroup label={grp.label} key={grp.label}>
              {grp.options.map(o => typeof o === 'string'
                ? <option value={o} key={o}>{o}</option>
                : <option value={o.v} key={o.v}>{o.t}</option>)}
            </optgroup>
          ))}
        </select>
      </div>

      <div className="inp-row">
        <label className="inp-label">Materia (opcional)</label>
        <input type="text" placeholder="Ej: Matemáticas, Inglés..." value={form.materia} onChange={e => set('materia', e.target.value)} />
      </div>

      <div className="inp-row">
        <label className="inp-label">Estado</label>
        <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
          {['activo', 'pausado', 'baja'].map(e => {
            const on = form.estado === e
            const c = ESTADO_BTN_CFG[e]
            const label = e === 'activo' ? '✓ Activo' : e === 'pausado' ? '⏸ Pausado' : '✗ Baja'
            return (
              <button type="button" key={e} onClick={() => set('estado', e)}
                style={{ flex: 1, padding: 8, borderRadius: 10, fontWeight: 700, fontSize: 12, cursor: 'pointer',
                  border: '1px solid ' + (on ? c.border : 'rgba(255,255,255,0.1)'),
                  background: on ? c.bg : 'rgba(255,255,255,0.05)',
                  color: on ? c.color : 'rgba(255,255,255,0.6)' }}>
                {label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="inp-row">
        <label className="inp-label">Fecha de alta</label>
        <input type="date" value={form.alta} onChange={e => set('alta', e.target.value)} />
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>
          Los pagos pendientes se calculan siempre desde esta fecha.
        </div>
      </div>

      <div className="inp-row">
        <label className="inp-label">Días de clase</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 2 }}>
          {DIAS_BTNS.map(d => (
            <button type="button" key={d.v} className={'dia-btn' + (form.dias.includes(d.v) ? ' on' : '')} onClick={() => toggleDia(d.v)}>{d.t}</button>
          ))}
        </div>
      </div>

      <div className="inp-row">
        <label className="inp-label">Turno</label>
        <select value={form.hora} onChange={e => set('hora', e.target.value)}>
          <option value="">Sin turno asignado</option>
          <option value="17:00">🕔 Turno 1 — 17:00 a 18:30</option>
          <option value="18:30">🕡 Turno 2 — 18:30 a 20:00</option>
        </select>
      </div>

      <div className="inp-row">
        <label className="inp-label">Modalidad de pago</label>
        <select value={form.modalidad} onChange={e => set('modalidad', e.target.value)}>
          <option value="fija">{MODALIDAD_CFG.fija.selectLabel}</option>
          <option value="pack">{MODALIDAD_CFG.pack.selectLabel}</option>
          <option value="sesion">{MODALIDAD_CFG.sesion.selectLabel}</option>
        </select>
      </div>

      <div className="inp-row">
        <label className="inp-label">{modCfg.tarifaLabel}</label>
        <input type="number" placeholder="0,00" step="0.01" min="0" value={form[modCfg.campo]} onChange={e => set(modCfg.campo, e.target.value)} />
      </div>

      {form.modalidad === 'fija' ? (
        <div className="inp-row">
          <label className="inp-label">Clases semanales incluidas en la mensualidad</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 2 }}>
            {CLASES_SEMANALES_OPCIONES.map(n => (
              <button type="button" key={n} className={'dia-btn' + (form.clasesSemanales === n ? ' on' : '')} onClick={() => toggleClasesSemanales(n)}>{n}</button>
            ))}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>
            Si algún mes registra más clases de las indicadas aquí, aparecerán como "Clases Extra" en Pagos.
          </div>
        </div>
      ) : null}

      {form.modalidad === 'fija' && form.clasesSemanales > 0 ? (
        <div className="inp-row">
          <label className="inp-label">Precio por clase extra (€)</label>
          <input type="number" placeholder="0,00" step="0.01" min="0" value={form.precioSesion} onChange={e => set('precioSesion', e.target.value)} />
        </div>
      ) : null}

      <div className="inp-row">
        <label className="inp-label">Notas (opcional)</label>
        <textarea placeholder="Observaciones..." value={form.notas} onChange={e => set('notas', e.target.value)}></textarea>
      </div>

      <button className="btn-primary" onClick={guardar}>Guardar alumno</button>
      <button className="btn-secondary" onClick={onClose}>Cancelar</button>
      {editing ? <button className="btn-danger" onClick={() => onDelete(editing.id)}>Eliminar alumno</button> : null}
    </Modal>
  )
}
