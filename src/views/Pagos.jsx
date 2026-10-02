import { useState, useEffect } from 'react'
import { MODALIDAD_CFG, MESES } from '../utils/constants'
import { todayStr, fmt } from '../utils/helpers'
import { getPendientesDetalle, getClasesExtraDetalle, describirCobertura } from '../utils/business'

function capitaliza(s) { return s.charAt(0).toUpperCase() + s.slice(1) }

function SectionHero({ icon, color, title, count, open, onToggle, children }) {
  return (
    <div className="section-hero">
      <div className="section-hero-header" onClick={onToggle}>
        <div className="section-hero-left">
          <div className={'section-hero-icon ' + color}>{icon}</div>
          <div className="section-hero-title">{title}</div>
          {count != null ? <span className="section-hero-count">{count}</span> : null}
        </div>
        <div className={'section-hero-toggle' + (open ? ' is-open' : '')}>▾</div>
      </div>
      {open ? <div className="section-hero-body">{children}</div> : null}
    </div>
  )
}

export default function Pagos({ data, registrarPago, eliminarPago, showToast, toastDeshacer, onAbrirWhatsapp, onAbrirConfirmacion, preselectAlumnoId }) {
  const { alumnos } = data
  const [alumnoId, setAlumnoId] = useState(preselectAlumnoId || alumnos[0]?.id || '')
  const [tipo, setTipo] = useState('recibido')
  const [importe, setImporte] = useState('')
  const [concepto, setConcepto] = useState('')
  const [fecha, setFecha] = useState(todayStr())
  // Solo alumnos mensuales: qué se está cobrando, la mensualidad o clases extra
  const [modoMensual, setModoMensual] = useState('mes')

  const [alumnoOpen, setAlumnoOpen] = useState(true)
  const [registrarOpen, setRegistrarOpen] = useState(true)
  const [historicoOpen, setHistoricoOpen] = useState(false)
  const [recordatorioOpen, setRecordatorioOpen] = useState(false)
  const [confirmacionOpen, setConfirmacionOpen] = useState(false)

  const hoy = new Date()
  const [mesSel, setMesSel] = useState(hoy.getMonth())
  const [anioSel, setAnioSel] = useState(hoy.getFullYear())
  const aniosDisponibles = [anioSel - 1, anioSel, anioSel + 1].filter((v, i, arr) => arr.indexOf(v) === i)

  const alumno = alumnos.find(a => a.id === alumnoId)
  const modCfg = alumno ? MODALIDAD_CFG[alumno.modalidad || 'fija'] : null
  const esMensual = alumno && alumno.modalidad === 'fija'
  const cobraMes = esMensual && modoMensual === 'mes'
  const admiteExtra = esMensual && alumno.clasesSemanales > 0
  const pendientes = alumno ? getPendientesDetalle(data, alumno) : []
  const clasesExtra = alumno ? getClasesExtraDetalle(data, alumno) : []

  useEffect(() => {
    if (alumno && modCfg) setImporte(String(alumno[modCfg.campo] || ''))
    setModoMensual('mes')
  }, [alumnoId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Para la mensualidad, el concepto se genera a partir del mes/año elegidos.
  // Al cambiar de alumno o de modalidad, se limpia cualquier concepto anterior.
  useEffect(() => {
    if (cobraMes) setConcepto(`Mensualidad de ${MESES[mesSel]} ${anioSel}`)
    else if (!esMensual) setConcepto('')
  }, [alumnoId, esMensual, cobraMes, mesSel, anioSel])

  function cambiarModo(modo) {
    if (!alumno || modo === modoMensual) return
    setModoMensual(modo)
    if (modo === 'extra') {
      setImporte(String(alumno.precioSesion || ''))
      setConcepto('1 clase extra')
    } else {
      setImporte(String(alumno.tarifa || ''))
    }
  }

  function aplicarPendiente(value) {
    const item = pendientes.find(p => p.value === value)
    if (!item) return
    setModoMensual('mes')
    setImporte(String(item.importe))
    setConcepto(item.concepto)
    setTipo('recibido')
    // Si el pendiente es mensual, su value viene como "YYYY-MM": sincroniza los selects
    if (esMensual && /^\d{4}-\d{2}$/.test(value)) {
      const [y, m] = value.split('-').map(Number)
      setAnioSel(y)
      setMesSel(m - 1)
    }
  }

  function aplicarClaseExtra(value) {
    const item = clasesExtra.find(p => p.value === value)
    if (!item) return
    setModoMensual('extra')
    setImporte(String(item.importe))
    setConcepto(item.concepto)
    setTipo('recibido')
  }

  function guardar() {
    const imp = parseFloat(importe)
    if (!alumnoId || !imp || !fecha) { showToast('Rellena todos los campos'); return }
    let pago = { alumnoId, importe: +imp.toFixed(2), concepto: concepto.trim() || 'Pago', fecha, tipo }
    if (cobraMes) pago.mesCorrespondiente = `${anioSel}-${String(mesSel + 1).padStart(2, '0')}`
    // Guarda en el propio pago qué cubre (mes, packs, sesiones o clases extra),
    // calculado con el precio de hoy: así no cambia aunque luego cambie la tarifa.
    const cubre = esMensual ? modoMensual : (alumno.modalidad || 'fija')
    pago = describirCobertura(alumno, pago, cubre)
    registrarPago(pago)
    if (!cobraMes) setConcepto(esMensual ? '1 clase extra' : '')
    showToast('Pago registrado')
  }

  const pagos = data.pagos.filter(p => p.alumnoId === alumnoId).slice().sort((a, b) => b.fecha.localeCompare(a.fecha))

  return (
    <div className="section-pad">
      <SectionHero icon="👤" color="blue" title="Alumno" open={alumnoOpen} onToggle={() => setAlumnoOpen(o => !o)}>
        <div className="inp-row">
          <label className="inp-label">Alumno</label>
          <select value={alumnoId} onChange={e => setAlumnoId(e.target.value)}>
            {alumnos.length
              ? alumnos.map(a => <option value={a.id} key={a.id}>{a.nombre}</option>)
              : <option value="">Sin alumnos</option>}
          </select>
        </div>

        {alumno && modCfg ? (
          <div className="card card-modalidad">
            <span className={'badge ' + modCfg.badgeClass}>{modCfg.label}</span>
            <span className="modalidad-precio">{fmt(alumno[modCfg.campo]) + ' ' + modCfg.suffix}</span>
          </div>
        ) : null}
      </SectionHero>

      <SectionHero icon="💳" color="purple" title="Registrar Pago" open={registrarOpen} onToggle={() => setRegistrarOpen(o => !o)}>
        <div className="seg">
          <button className={'seg-btn' + (tipo === 'recibido' ? ' on' : '')} onClick={() => setTipo('recibido')}>✓ Cobrado</button>
          <button className={'seg-btn' + (tipo === 'pendiente' ? ' on' : '')} onClick={() => setTipo('pendiente')}>⏳ Pendiente</button>
        </div>
        {admiteExtra ? (
          <div className="seg">
            <button className={'seg-btn' + (modoMensual === 'mes' ? ' on' : '')} onClick={() => cambiarModo('mes')}>📅 Mensualidad</button>
            <button className={'seg-btn' + (modoMensual === 'extra' ? ' on' : '')} onClick={() => cambiarModo('extra')}>⚡ Clase extra</button>
          </div>
        ) : null}
        <div className="inp-row">
          <label className="inp-label">Importe (€)</label>
          <input type="number" placeholder="0,00" step="0.01" min="0" value={importe} onChange={e => setImporte(e.target.value)} />
        </div>

        {alumno && pendientes.length ? (
          <div className="inp-row">
            <label className="inp-label">Pagos pendientes</label>
            <select value="" onChange={e => aplicarPendiente(e.target.value)}>
              <option value="">{pendientes.length} pendiente{pendientes.length > 1 ? 's' : ''} · Seleccionar...</option>
              {pendientes.map(p => <option value={p.value} key={p.value}>{p.label}</option>)}
            </select>
          </div>
        ) : null}

        {alumno && clasesExtra.length ? (
          <div className="inp-row">
            <label className="inp-label">⚡ Clases Extra</label>
            <select className="select-extra" value="" onChange={e => aplicarClaseExtra(e.target.value)}>
              <option value="">{clasesExtra.length} sin cobrar · Seleccionar...</option>
              {clasesExtra.map(p => <option value={p.value} key={p.value}>{p.label}</option>)}
            </select>
            <div className="aviso-extra">
              Este alumno ha dado más clases de las incluidas en su mensualidad.
            </div>
          </div>
        ) : null}

        {cobraMes ? (
          <div className="inp-row">
            <label className="inp-label">Mensualidad correspondiente</label>
            <div className="fila-mes">
              <select value={mesSel} onChange={e => setMesSel(parseInt(e.target.value))}>
                {MESES.map((m, i) => <option value={i} key={i}>{capitaliza(m)}</option>)}
              </select>
              <select value={anioSel} onChange={e => setAnioSel(parseInt(e.target.value))}>
                {aniosDisponibles.map(y => <option value={y} key={y}>{y}</option>)}
              </select>
            </div>
          </div>
        ) : (
          <div className="inp-row">
            <label className="inp-label">Concepto</label>
            <input type="text" placeholder="Ej: Clase particular..." value={concepto} onChange={e => setConcepto(e.target.value)} />
          </div>
        )}
        <div className="inp-row">
          <label className="inp-label">Fecha</label>
          <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} />
        </div>
        <button className="btn-primary" onClick={guardar}>Registrar pago</button>
      </SectionHero>

      <SectionHero icon="🧾" color="green" title="Histórico de Pagos" count={pagos.length} open={historicoOpen} onToggle={() => setHistoricoOpen(o => !o)}>
        {!alumnoId ? <p className="empty">Selecciona un alumno</p> : !pagos.length ? (
          <p className="empty">Sin pagos registrados</p>
        ) : (
          pagos.map(p => (
            <div className="hist-item" key={p.id}>
              <div className="flex-1">
                <div className="txt-titulo">{p.concepto}</div>
                <div className="txt-sub">{new Date(p.fecha + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
              </div>
              <span className={'badge badge-mr ' + (p.tipo === 'recibido' ? 'badge-ok' : 'badge-pend')}>{fmt(p.importe)}</span>
              <button className="icon-btn" onClick={() => toastDeshacer('Pago eliminado', eliminarPago(p.id))}>✕</button>
            </div>
          ))
        )}
      </SectionHero>

      <SectionHero icon="💬" color="whatsapp" title="Recordatorio" open={recordatorioOpen} onToggle={() => setRecordatorioOpen(o => !o)}>
        <button onClick={onAbrirWhatsapp} className="btn-wa-outline">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#25d366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Enviar recordatorio WhatsApp
        </button>
      </SectionHero>

      <SectionHero icon="✅" color="whatsapp" title="Confirmación Pago" open={confirmacionOpen} onToggle={() => setConfirmacionOpen(o => !o)}>
        <button onClick={() => onAbrirConfirmacion(alumnoId)} className="btn-wa-outline">
          ✅ Confirmar pago
        </button>
      </SectionHero>
    </div>
  )
}
