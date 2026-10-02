import { fmt, todayStr } from './helpers'
import { MESES, CLASES_POR_PACK } from './constants'

function inicioSemana(d) {
  const dd = new Date(d)
  const dow = dd.getDay()
  dd.setDate(dd.getDate() - ((dow === 0 ? 7 : dow) - 1))
  dd.setHours(0, 0, 0, 0)
  return dd
}

// Fecha desde la que cuenta el conteo de pendientes: siempre la fecha de alta
// del alumno (se actualiza también al reactivar desde pausado/baja). Se
// mantiene "activoDesde" como alternativa solo por compatibilidad con datos
// guardados antes de este cambio.
function inicioConteo(alumno) {
  return alumno.alta || alumno.activoDesde || todayStr()
}

// Sesiones "presente" cuya fecha ya ha pasado (no cuentan las de hoy ni futuras)
// y que son posteriores al inicio del conteo vigente para el alumno.
function sesionesPasadas(d, alumno) {
  const hoyISO = todayStr()
  const desde = inicioConteo(alumno)
  return d.sesiones.filter(s => s.alumnoId === alumno.id && s.estado === 'presente' && s.fecha < hoyISO && s.fecha >= desde)
}

function capitaliza(s) { return s.charAt(0).toUpperCase() + s.slice(1) }

// Mientras un alumno está inactivo, no se genera ningún pago pendiente nuevo.
function conteoParalizado(alumno) {
  return (alumno.estado || 'activo') !== 'activo'
}

// ---- Qué cubre cada pago ----
// Cada pago cobrado guarda a qué corresponde, en el momento de registrarlo:
//   cubre: 'mes'    → una mensualidad (con mesCorrespondiente "AAAA-MM")
//   cubre: 'pack'   → unidades = nº de packs que paga
//   cubre: 'sesion' → unidades = nº de sesiones que paga
//   cubre: 'extra'  → unidades = nº de clases extra que paga (alumnos mensuales)
// Las unidades se calculan con el precio vigente AL COBRAR, así que cambiar
// después la tarifa o la modalidad del alumno ya no reinterpreta pagos pasados.

function precioUnidad(alumno, cubre) {
  if (cubre === 'pack') return alumno.precioPack || 0
  if (cubre === 'sesion' || cubre === 'extra') return alumno.precioSesion || 0
  return alumno.tarifa || 0
}

// Devuelve el pago con "cubre" y, si procede, "unidades" ya calculadas.
export function describirCobertura(alumno, pago, cubre) {
  if (!alumno || pago.tipo !== 'recibido') return pago
  if (cubre === 'mes') return { ...pago, cubre }
  const precio = precioUnidad(alumno, cubre)
  return { ...pago, cubre, unidades: precio > 0 ? +(pago.importe / precio).toFixed(4) : 0 }
}

// Suma de unidades pagadas de un tipo desde el inicio del conteo vigente.
// Se admiten pagos parciales: dos pagos de medio pack cuentan como un pack.
function unidadesPagadas(d, alumno, cubre) {
  const desde = inicioConteo(alumno)
  const total = d.pagos
    .filter(p => p.alumnoId === alumno.id && p.tipo === 'recibido' && p.cubre === cubre && p.fecha >= desde)
    .reduce((s, p) => s + (p.unidades || 0), 0)
  return Math.floor(total + 1e-6)
}

// Convierte pagos guardados antes de existir "cubre" al formato nuevo. Usa
// la modalidad y los precios actuales del alumno, que es exactamente como la
// app los interpretaba hasta ahora, de modo que las cifras no cambian; a
// partir de aquí quedan fijados. Es idempotente: solo toca pagos sin "cubre".
export function migrarPagos(d) {
  let cambio = false
  const pagos = (d.pagos || []).map(p => {
    if (p.cubre || p.tipo !== 'recibido') return p
    const a = (d.alumnos || []).find(x => x.id === p.alumnoId)
    if (!a) return p
    cambio = true
    if (/clase extra/i.test(p.concepto || '')) {
      // Antes, cobrar una clase extra a un alumno mensual guardaba también un
      // mes y lo daba por pagado por error: aquí se le quita ese mes.
      const { mesCorrespondiente, ...resto } = p // eslint-disable-line no-unused-vars
      return describirCobertura(a, resto, 'extra')
    }
    if (p.mesCorrespondiente) return { ...p, cubre: 'mes' }
    const mod = a.modalidad || 'fija'
    if (mod === 'fija') return { ...p, cubre: 'mes', mesCorrespondiente: p.fecha.slice(0, 7) }
    return describirCobertura(a, p, mod)
  })
  return cambio ? { ...d, pagos } : d
}

// ---- Periodos pendientes por modalidad (fuente única de verdad) ----

function pendientesMensuales(d, alumno) {
  if (conteoParalizado(alumno)) return []
  const hoy = new Date()
  const desde = inicioConteo(alumno)
  const inicio = new Date(desde + 'T12:00:00')
  let y = inicio.getFullYear(), m = inicio.getMonth()
  const limitY = hoy.getFullYear(), limitM = hoy.getMonth()
  const out = []
  let guard = 0
  // El mes en curso cuenta como pendiente desde el día 1, igual que cualquier
  // otro mes vencido (antes se esperaba a mediados de mes para mostrarlo).
  while ((y < limitY || (y === limitY && m <= limitM)) && guard < 24) {
    const clave = `${y}-${String(m + 1).padStart(2, '0')}`
    // Un mes se considera cobrado si existe un pago "recibido" de
    // mensualidad cuyo mes correspondiente coincide con este periodo.
    const ok = d.pagos.some(p =>
      p.alumnoId === alumno.id && p.tipo === 'recibido' && p.cubre === 'mes' && p.mesCorrespondiente === clave
    )
    if (!ok) {
      const periodo = `${capitaliza(MESES[m])} ${y}`
      out.push({
        value: `${y}-${String(m + 1).padStart(2, '0')}`,
        label: `${periodo} · ${fmt(alumno.tarifa)}`,
        importe: alumno.tarifa,
        periodo,
        concepto: `Mensualidad de ${MESES[m]} ${y}`
      })
    }
    m++; if (m > 11) { m = 0; y++ }
    guard++
  }
  return out
}

// Nº de clases "presente" consumidas desde el inicio del conteo vigente.
// A diferencia de sesionesPasadas, incluye también la clase de hoy (el
// contador debe descontar en el momento en que se registra la asistencia).
function clasesConsumidasPack(d, alumno) {
  const desde = inicioConteo(alumno)
  return d.sesiones.filter(s => s.alumnoId === alumno.id && s.estado === 'presente' && s.fecha >= desde).length
}

// Pack Clases: bloque prepagado de CLASES_POR_PACK clases. Cada vez que las
// clases consumidas superan los packs ya pagados, se genera un nuevo pack
// pendiente de cobro.
function pendientesPack(d, alumno) {
  if (conteoParalizado(alumno)) return []
  const consumidas = clasesConsumidasPack(d, alumno)
  const packsNecesarios = Math.ceil(consumidas / CLASES_POR_PACK)
  const packsPagados = unidadesPagadas(d, alumno, 'pack')
  const pend = packsNecesarios - packsPagados
  if (pend <= 0) return []
  const out = []
  for (let n = 1; n <= pend; n++) {
    out.push({
      value: 'pack-' + n,
      label: `${n} pack${n > 1 ? 's' : ''} de ${CLASES_POR_PACK} clases · ${fmt(n * alumno.precioPack)}`,
      importe: n * alumno.precioPack,
      periodo: `${n} pack${n > 1 ? 's' : ''} de ${CLASES_POR_PACK} clases`,
      concepto: `${n} pack${n > 1 ? 's' : ''} de ${CLASES_POR_PACK} clases`
    })
  }
  return out
}

// Estado del contador de clases del pack vigente (para mostrar en el perfil
// del alumno): cuántas clases quedan dentro del bloque de 6 actualmente en curso.
export function getClasesPackInfo(d, alumno) {
  if (!alumno || alumno.modalidad !== 'pack') return null
  const consumidas = clasesConsumidasPack(d, alumno)
  const enPackActual = consumidas % CLASES_POR_PACK
  const restantes = enPackActual === 0 ? CLASES_POR_PACK : CLASES_POR_PACK - enPackActual
  return { consumidas, restantes, total: CLASES_POR_PACK }
}

function pendientesSesiones(d, alumno) {
  if (conteoParalizado(alumno)) return []
  const ses = sesionesPasadas(d, alumno).length
  const pag = unidadesPagadas(d, alumno, 'sesion')
  const pend = ses - pag
  if (pend <= 0) return []
  const out = []
  for (let n = 1; n <= pend; n++) {
    out.push({
      value: String(n),
      label: `${n} sesión${n > 1 ? 'es' : ''} pendiente${n > 1 ? 's' : ''} · ${fmt(n * alumno.precioSesion)}`,
      importe: n * alumno.precioSesion,
      concepto: `${n} sesión${n > 1 ? 'es' : ''} pendiente${n > 1 ? 's' : ''}`
    })
  }
  return out
}

// Nº total de clases extra acumuladas desde el inicio del conteo: suma, semana a
// semana, de las sesiones "presente" que superan el nº de clases semanales
// incluidas en la mensualidad del alumno.
function clasesExtraAcumuladas(d, alumno) {
  if (!alumno.clasesSemanales || alumno.clasesSemanales <= 0) return 0
  const hoy = new Date()
  const hoyLunes = inicioSemana(hoy)
  let cursor = inicioSemana(new Date(inicioConteo(alumno) + 'T12:00:00'))
  const maxLookbackMs = 24 * 7 * 24 * 60 * 60 * 1000
  if (hoyLunes - cursor > maxLookbackMs) cursor = new Date(hoyLunes.getTime() - maxLookbackMs)
  let total = 0
  let guard = 0
  while (cursor <= hoyLunes && guard < 30) {
    const domingo = new Date(cursor); domingo.setDate(cursor.getDate() + 6); domingo.setHours(23, 59, 59, 999)
    const count = d.sesiones.filter(s => {
      if (s.alumnoId !== alumno.id || s.estado !== 'presente') return false
      const f = new Date(s.fecha + 'T12:00:00')
      return f >= cursor && f <= domingo
    }).length
    if (count > alumno.clasesSemanales) total += (count - alumno.clasesSemanales)
    cursor = new Date(cursor); cursor.setDate(cursor.getDate() + 7)
    guard++
  }
  return total
}

// Clases extra pendientes de cobro (solo alumnos de modalidad mensual con
// un nº de clases semanales configurado). Cada elemento permite registrar
// el cobro de 1..N clases extra con un clic, igual que el resto de pendientes.
export function getClasesExtraDetalle(d, alumno) {
  if (!alumno || conteoParalizado(alumno)) return []
  if (alumno.modalidad !== 'fija' || !alumno.clasesSemanales) return []
  const totalExtra = clasesExtraAcumuladas(d, alumno)
  if (totalExtra <= 0) return []
  const precio = alumno.precioSesion || 0
  const pagadas = unidadesPagadas(d, alumno, 'extra')
  const pend = totalExtra - pagadas
  if (pend <= 0) return []
  const out = []
  for (let n = 1; n <= pend; n++) {
    out.push({
      value: 'extra-' + n,
      label: `${n} clase${n > 1 ? 's' : ''} extra · ${fmt(n * precio)}`,
      importe: n * precio,
      concepto: `${n} clase${n > 1 ? 's' : ''} extra`
    })
  }
  return out
}

// Resumen (count/importe) de clases extra pendientes, para plegarlo en las alertas.
function getResumenClasesExtra(d, alumno) {
  const items = getClasesExtraDetalle(d, alumno)
  const pend = items.length
  return { count: pend, importe: pend * (alumno.precioSesion || 0) }
}

// Lista de periodos pendientes de cobro para un alumno, según su modalidad de pago.
// Cada elemento sirve para rellenar el formulario de "Registrar pago" con un clic.
export function getPendientesDetalle(d, alumno) {
  if (!alumno) return []
  if (alumno.modalidad === 'fija') return pendientesMensuales(d, alumno)
  if (alumno.modalidad === 'pack') return pendientesPack(d, alumno)
  return pendientesSesiones(d, alumno)
}

// Resumen único de lo pendiente de un alumno: nº de periodos, importe total,
// y texto legible de a qué corresponde (usado en alertas y en WhatsApp).
// En modalidad mensual incluye también las clases extra sin cobrar.
export function getResumenPendiente(d, alumno) {
  if (!alumno || conteoParalizado(alumno)) return { count: 0, importe: 0, texto: '' }
  if (alumno.modalidad === 'fija') {
    const items = pendientesMensuales(d, alumno)
    const extra = getResumenClasesExtra(d, alumno)
    const importe = items.reduce((s, it) => s + it.importe, 0) + extra.importe
    let texto = items.map(it => it.periodo).join(' y ')
    if (extra.count > 0) {
      const extraTxt = `${extra.count} clase${extra.count > 1 ? 's' : ''} extra`
      texto = texto ? `${texto} y ${extraTxt}` : extraTxt
    }
    return { count: items.length + extra.count, importe, texto }
  }
  if (alumno.modalidad === 'pack') {
    // La lista de packs son opciones acumuladas ("1 pack", "2 packs"...): el
    // total pendiente es la última opción, no la suma de todas.
    const items = pendientesPack(d, alumno)
    const ultimo = items[items.length - 1]
    return { count: items.length, importe: ultimo ? ultimo.importe : 0, texto: ultimo ? ultimo.periodo : '' }
  }
  const items = pendientesSesiones(d, alumno)
  const pend = items.length
  const importe = pend * (alumno.precioSesion || 0)
  const texto = pend > 0 ? `${pend} sesión${pend > 1 ? 'es' : ''} pendiente${pend > 1 ? 's' : ''}` : ''
  return { count: pend, importe, texto }
}

// Alumnos con algún pago pendiente (misma fuente que la pestaña Pagos).
// Cada alerta es simplemente: nombre del alumno + número de pagos pendientes.
// Los alumnos pausados o de baja nunca generan alertas.
export function getAlertas(d) {
  const res = []
  d.alumnos.forEach(a => {
    if (conteoParalizado(a)) return
    const resumen = getResumenPendiente(d, a)
    if (resumen.count > 0) res.push({ nombre: a.nombre, count: resumen.count })
  })
  return res
}

// Importe pendiente formateado para un alumno concreto (usado en la info de pago)
export function getPendienteFmt(d, alumnoId) {
  const a = d.alumnos.find(x => x.id === alumnoId)
  if (!a) return '0,00 €'
  return fmt(getResumenPendiente(d, a).importe)
}

// Último pago "recibido" (cobrado) de un alumno, el más reciente por fecha.
// Se usa para rellenar el mensaje de confirmación de pago.
export function getUltimoPagoRecibido(d, alumnoId) {
  const pagos = d.pagos
    .filter(p => p.alumnoId === alumnoId && p.tipo === 'recibido')
    .slice()
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
  return pagos[0] || null
}

// Texto legible de "a qué mes/periodo corresponde" un pago, para el mensaje
// de confirmación: el mes correspondiente si es una mensualidad, o si no, su concepto.
export function formatoMensualidadPago(pago) {
  if (!pago) return ''
  if (pago.mesCorrespondiente) {
    const [y, m] = pago.mesCorrespondiente.split('-').map(Number)
    return `${capitaliza(MESES[m - 1])} ${y}`
  }
  return pago.concepto || ''
}
