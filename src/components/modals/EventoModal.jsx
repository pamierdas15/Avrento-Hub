import { useState, useEffect } from 'react'
import Modal from '../Modal.jsx'
import { TURNOS, FEST_CFG, PLAZAS_POR_TURNO } from '../../utils/constants'
import { initials, alumnoColor, etiquetaTurno, claseTurno } from '../../utils/helpers'
import { clasesDelDia, agruparPorTurno, claveTurno, plazasOcupadas } from '../../utils/business'

// Ventana de gestión de clases de un día (clases puntuales). Se abre desde
// Inicio y desde el calendario de Asistencia. Tres vistas:
//   'dia'    → lista de clases del día por turno, con plazas y acciones
//   'anadir' → añadir una clase puntual a un alumno en una fecha y turno
//   'mover'  → mover una clase a otra fecha / turno (solo esa vez)

const fechaTxt = iso => new Date(iso + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
const fechaCorta = iso => new Date(iso + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })

// Cabecera de un turno con sus plazas ocupadas ("Tarde · 17–18:30   3/4").
// También la usa Inicio.
export function CabeceraTurno({ grupo }) {
  const titulo = grupo.clave === 'sin' ? 'Sin turno asignado' : grupo.fijo ? TURNOS[grupo.clave] : 'Personalizado · ' + grupo.hora
  let estado = 'ok'
  if (grupo.plazas != null && grupo.ocupadas >= grupo.plazas) estado = grupo.ocupadas > grupo.plazas ? 'exceso' : 'lleno'
  const libres = grupo.plazas != null ? grupo.plazas - grupo.ocupadas : null
  return (
    <div className="turno-grupo-head">
      <span className="turno-grupo-titulo">{titulo}</span>
      {grupo.plazas != null ? (
        <span className={'cupo cupo-' + estado}>
          {grupo.ocupadas}/{grupo.plazas}{libres > 0 ? ` · ${libres} libre${libres > 1 ? 's' : ''}` : estado === 'lleno' ? ' · completo' : ' · sobrecupo'}
        </span>
      ) : null}
    </div>
  )
}

// Texto corto del estado especial de una clase (badge)
export function badgeClase(c) {
  if (c.cancelada) return { cls: 'badge-cancel', txt: c.movidaA ? 'Movida → ' + fechaCorta(c.movidaA) : 'Cancelada' }
  if (c.recuperacion) return { cls: 'badge-recup', txt: c.movidaDe ? 'Recupera ' + fechaCorta(c.movidaDe) : 'Recuperación' }
  if (c.puntual) return { cls: 'badge-puntual', txt: 'Puntual' }
  return null
}

function turnoDesde(h, hf) {
  if (hf) return 'personalizado'
  if (TURNOS[h]) return h
  return h ? 'personalizado' : '17:00'
}

export default function EventoModal({ open, modo, fecha, clase, data, esFestivo, acciones, onClose, showToast, toastDeshacer }) {
  const [vista, setVista] = useState('dia')
  const [desdeDia, setDesdeDia] = useState(false)
  const [fechaSel, setFechaSel] = useState('')   // fecha del formulario (añadir / mover)
  const [diaFecha, setDiaFecha] = useState('')   // día que se está gestionando en la vista 'dia'
  const [claseSel, setClaseSel] = useState(null)
  const [alumnoId, setAlumnoId] = useState('')
  const [turno, setTurno] = useState('17:00')
  const [hora, setHora] = useState('16:00')
  const [horaFin, setHoraFin] = useState('17:30')

  const alumnosActivos = (data.alumnos || []).filter(a => (a.estado || 'activo') === 'activo')

  function prepararTurno(h, hf) {
    const t = turnoDesde(h, hf)
    setTurno(t)
    setHora(t === 'personalizado' ? (h || '16:00') : '16:00')
    setHoraFin(t === 'personalizado' ? (hf || '') : '17:30')
  }

  function irAnadir(f, desde) {
    const primero = alumnosActivos[0]
    setVista('anadir'); setDesdeDia(!!desde); setFechaSel(f)
    setAlumnoId(primero ? primero.id : '')
    prepararTurno(primero ? primero.hora : '17:00', primero ? primero.horaFin : '')
  }

  function irMover(c, desde) {
    setVista('mover'); setDesdeDia(!!desde); setClaseSel(c); setFechaSel(c.fecha)
    prepararTurno(c.hora, c.horaFin)
  }

  useEffect(() => {
    if (!open) return
    if (modo === 'anadir') irAnadir(fecha, false)
    else if (modo === 'mover' && clase) irMover(clase, false)
    else { setVista('dia'); setDiaFecha(fecha); setFechaSel(fecha) }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  function elegirAlumno(id) {
    setAlumnoId(id)
    const a = alumnosActivos.find(x => x.id === id)
    if (a) prepararTurno(a.hora, a.horaFin)
  }

  function volver() {
    if (desdeDia) setVista('dia')
    else onClose()
  }

  // Turno elegido en el formulario → { hora, horaFin }
  const destino = turno === 'personalizado' ? { hora, horaFin } : { hora: turno, horaFin: '' }
  const claveDestino = claveTurno(destino)
  const ocupadas = fechaSel && destino.hora ? plazasOcupadas(data, fechaSel, claveDestino, vista === 'mover' && claseSel ? claseSel.key : null) : 0
  const fesDestino = fechaSel && esFestivo ? esFestivo(fechaSel) : null

  function validar() {
    if (!fechaSel) { showToast('Elige una fecha'); return false }
    if (turno === 'personalizado') {
      if (!hora || !horaFin) { showToast('Indica la hora de inicio y de fin'); return false }
      if (horaFin <= hora) { showToast('La hora de fin debe ser posterior a la de inicio'); return false }
    }
    if (ocupadas >= PLAZAS_POR_TURNO && !confirm(`Ese turno ya tiene ${ocupadas}/${PLAZAS_POR_TURNO} plazas ocupadas. ¿Añadir igualmente?`)) return false
    return true
  }

  function guardarAnadir() {
    if (!alumnoId) { showToast('Selecciona un alumno'); return }
    if (!validar()) return
    const repetida = clasesDelDia(data, fechaSel).some(c => !c.cancelada && c.alumno.id === alumnoId && claveTurno(c) === claveDestino)
    if (repetida) { showToast('Ese alumno ya tiene clase ese día en ese turno'); return }
    const deshacer = acciones.anadirClase({ alumnoId, fecha: fechaSel, ...destino })
    toastDeshacer('Clase añadida', deshacer)
    volver()
  }

  function guardarMover() {
    if (!claseSel || !validar()) return
    if (fechaSel === claseSel.fecha && claveDestino === claveTurno(claseSel) && destino.horaFin === (claseSel.horaFin || '')) {
      showToast('Elige otra fecha u otro turno'); return
    }
    const deshacer = acciones.moverClase(claseSel, { fecha: fechaSel, ...destino })
    toastDeshacer('Clase movida', deshacer)
    volver()
  }

  function cancelar(c) {
    toastDeshacer(c.puntual ? 'Clase quitada' : 'Clase cancelada', acciones.cancelarClase(c))
  }

  function restaurar(c) {
    toastDeshacer('Clase restaurada', acciones.restaurarClase(c))
  }

  // ---- Bloques comunes del formulario (fecha + turno + plazas) ----
  const camposFechaTurno = (
    <>
      <div className="inp-row">
        <label className="inp-label">Fecha</label>
        <input type="date" value={fechaSel} onChange={e => setFechaSel(e.target.value)} />
      </div>
      <div className="inp-row">
        <label className="inp-label">Turno</label>
        <select value={turno} onChange={e => { setTurno(e.target.value); if (e.target.value === 'personalizado' && !horaFin) { setHora('16:00'); setHoraFin('17:30') } }}>
          <option value="11:00">☀️ Turno mañana — 11:00 a 12:30</option>
          <option value="17:00">🕔 Turno tarde — 17:00 a 18:30</option>
          <option value="personalizado">✏️ Horario personalizado</option>
        </select>
        {turno === 'personalizado' ? (
          <div className="fila-horas">
            <div>
              <label className="inp-label">Desde</label>
              <input type="time" value={hora} onChange={e => setHora(e.target.value)} />
            </div>
            <div>
              <label className="inp-label">Hasta</label>
              <input type="time" value={horaFin} onChange={e => setHoraFin(e.target.value)} />
            </div>
          </div>
        ) : null}
      </div>
      {fesDestino ? <div className="aviso-ambar">{FEST_CFG[fesDestino.tipo].ico} Ese día está marcado como {FEST_CFG[fesDestino.tipo].label.toLowerCase()}.</div> : null}
      {fechaSel && destino.hora ? (
        <div className={'plazas-info' + (ocupadas >= PLAZAS_POR_TURNO ? ' lleno' : '')}>
          {ocupadas >= PLAZAS_POR_TURNO
            ? `Turno completo: ${ocupadas}/${PLAZAS_POR_TURNO} plazas ocupadas`
            : `Plazas ocupadas: ${ocupadas}/${PLAZAS_POR_TURNO} · quedan ${PLAZAS_POR_TURNO - ocupadas} libre${PLAZAS_POR_TURNO - ocupadas > 1 ? 's' : ''}`}
        </div>
      ) : null}
    </>
  )

  if (!open) return <Modal open={false}></Modal>

  // ---- Vista: añadir ----
  if (vista === 'anadir') {
    return (
      <Modal open={open}>
        <div className="modal-head">
          <div className="modal-ico ico-azul">➕</div>
          <div className="modal-head-title">Añadir clase puntual</div>
        </div>
        <div className="inp-row">
          <label className="inp-label">Alumno</label>
          <select value={alumnoId} onChange={e => elegirAlumno(e.target.value)}>
            {alumnosActivos.length
              ? alumnosActivos.map(a => <option value={a.id} key={a.id}>{a.nombre}</option>)
              : <option value="">Sin alumnos activos</option>}
          </select>
        </div>
        {camposFechaTurno}
        <button className="btn-primary" onClick={guardarAnadir}>Añadir clase</button>
        <button className="btn-secondary" onClick={volver}>{desdeDia ? '← Volver' : 'Cancelar'}</button>
      </Modal>
    )
  }

  // ---- Vista: mover ----
  if (vista === 'mover' && claseSel) {
    return (
      <Modal open={open}>
        <div className="modal-head">
          <div className="modal-ico ico-azul">⇄</div>
          <div className="modal-head-title">Mover clase de {claseSel.alumno.nombre}</div>
        </div>
        <div className="modal-desc">
          Ahora: <span className="txt-cap">{fechaTxt(claseSel.fecha)}</span>{claseSel.hora ? ' · ' + etiquetaTurno(claseSel) : ''}.
          {claseSel.puntual ? '' : ' Solo se mueve esta clase; la semana siguiente vuelve a su horario habitual.'}
        </div>
        {camposFechaTurno}
        <button className="btn-primary" onClick={guardarMover}>Mover clase</button>
        <button className="btn-secondary" onClick={volver}>{desdeDia ? '← Volver' : 'Cancelar'}</button>
      </Modal>
    )
  }

  // ---- Vista: día ----
  const fes = esFestivo ? esFestivo(diaFecha) : null
  const grupos = agruparPorTurno(clasesDelDia(data, diaFecha), true)
  return (
    <Modal open={open}>
      <div className="modal-head">
        <div className="modal-ico ico-azul">📅</div>
        <div className="modal-head-title txt-cap">{diaFecha ? fechaTxt(diaFecha) : ''}</div>
      </div>
      {fes ? <div className="aviso-ambar">{FEST_CFG[fes.tipo].ico} {FEST_CFG[fes.tipo].label}{fes.nota ? ' · ' + fes.nota : ''}</div> : null}

      {grupos.map(g => (
        <div key={g.clave} className="mb-14">
          <CabeceraTurno grupo={g} />
          {!g.clases.length ? <div className="turno-grupo-vacio">Sin alumnos en este turno</div> : g.clases.map(c => {
            const b = badgeClase(c)
            const t = claseTurno(c)
            return (
              <div key={c.key} className={'dia-clase turno-' + t + (c.cancelada ? ' is-cancelada' : '')}>
                <div className="fila-alumno">
                  <div className="avatar avatar-28" style={{ background: alumnoColor(data.alumnos.indexOf(c.alumno)) }}>{initials(c.alumno.nombre)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="txt-titulo">{c.alumno.nombre}</div>
                    <div className="txt-sub">{etiquetaTurno(c) || 'Sin turno'}{b ? <span className={'badge badge-mini ' + b.cls}>{b.txt}</span> : null}</div>
                  </div>
                </div>
                <div className="mini-btn-row mt-8">
                  {c.cancelada ? (
                    <button className="mini-btn mini-btn-restaurar" onClick={() => restaurar(c)}>↺ Restaurar clase</button>
                  ) : (
                    <>
                      <button className="mini-btn mini-btn-mover" onClick={() => irMover(c, true)}>⇄ Mover</button>
                      <button className="mini-btn mini-btn-cancelar" onClick={() => cancelar(c)}>{c.puntual ? '✕ Quitar' : '✕ Cancelar'}</button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ))}

      <button className="btn-primary" onClick={() => irAnadir(diaFecha, true)}>+ Añadir clase</button>
      <button className="btn-secondary" onClick={onClose}>Cerrar</button>
    </Modal>
  )
}
