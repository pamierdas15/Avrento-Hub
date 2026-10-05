export const SK = 'avrento_hub_v1'
export const WA_SK = 'avrento_wa'
export const WA_CONFIRM_SK = 'avrento_wa_confirmacion'
export const FES_SK = 'avrento_festivos'
export const BACKUP_SK = 'avrento_ultimo_backup'
export const AUTO_BACKUP_SK = 'avrento_auto_backup_on'

export const DIAS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
export const DIAS_FULL = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
export const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
export const COLORS = ['#2563eb', '#1d9e75', '#7c3aed', '#db2777', '#d97706', '#0891b2', '#059669', '#dc2626']
// Turnos fijos (clave = hora de inicio). Cualquier otro horario se configura
// como "Horario personalizado" en la ficha del alumno.
// Plazas disponibles en cada turno (para mostrar los huecos libres)
export const PLAZAS_POR_TURNO = 4

export const TURNOS = { '11:00': 'Mañana · 11–12:30', '17:00': 'Tarde · 17–18:30' }

// Los colores de cada estado están en styles.css (.estado-activo / .estado-inactivo
// y .estado-btn.on-activo / .on-inactivo).
export const ESTADO_CFG = {
  activo: { cls: 'estado-activo', txt: '✓ Activo' },
  inactivo: { cls: 'estado-inactivo', txt: '✗ Inactivo' }
}

// Devuelve la configuración visual del estado de un alumno. Normaliza valores
// antiguos ("pausado"/"baja", de antes de simplificar a solo Activo/Inactivo)
// hacia "inactivo" para que perfiles guardados previamente sigan mostrándose bien.
export function estadoCfg(estado) {
  return ESTADO_CFG[estado] || ESTADO_CFG.inactivo
}

export const FEST_CFG = {
  festivo: { ico: '🎉', label: 'Festivo', color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.25)' },
  vacaciones: { ico: '🏖', label: 'Vacaciones', color: '#34d399', bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.25)' },
  ausencia: { ico: '🤒', label: 'Ausencia docente', color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.25)' }
}

export const FTIPO_BTN_CFG = {
  festivo: { bg: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: 'rgba(251,191,36,0.4)' },
  vacaciones: { bg: 'rgba(52,211,153,0.12)', color: '#34d399', border: 'rgba(52,211,153,0.4)' },
  ausencia: { bg: 'rgba(248,113,113,0.12)', color: '#f87171', border: 'rgba(248,113,113,0.4)' }
}

// Plantillas de recordatorio de WhatsApp según la modalidad de pago del alumno.
// Placeholders disponibles en las tres: {nombre}, {importe}, {pendientes}
export const WA_DEFAULTS = {
  fija: 'Muy buenas {nombre}. Solo quería recordarte que está pendiente de pago el mes de {pendientes}, con un importe de {importe}. Gracias de antemano.',
  pack: 'Muy buenas {nombre}. Solo quería recordarte que está pendiente de pago un nuevo pack de clases, que corresponde a {pendientes}, con un importe de {importe}. Gracias de antemano.',
  sesion: 'Muy buenas {nombre}. Solo quería recordarte que está pendiente de pago el importe de {importe}, que corresponde a {pendientes}. Gracias de antemano.'
}

// Plantilla de confirmación de pago (mensaje de WhatsApp tras registrar un
// cobro). Placeholders disponibles: {nombre}, {importe}, {mensualidad}
export const WA_CONFIRM_DEFAULT = 'Buenas, {nombre}👋! Pago de {importe} €, correspondiente al {mensualidad}, recibido correctamente. ¡Muchas gracias! 👍'

// Modalidades de pago disponibles para un alumno
export const MODALIDAD_CFG = {
  fija: { label: 'Mensual', badgeClass: 'badge-fija', suffix: '/mes', campo: 'tarifa', tarifaLabel: 'Tarifa mensual (€)', selectLabel: 'Pago mensual' },
  pack: { label: 'Pack Clases', badgeClass: 'badge-pack', suffix: '/pack', campo: 'precioPack', tarifaLabel: 'Precio del pack de 6 clases (€)', selectLabel: 'Pack Clases' },
  sesion: { label: 'Por sesión', badgeClass: 'badge-sesion', suffix: '/ses.', campo: 'precioSesion', tarifaLabel: 'Precio por sesión (€)', selectLabel: 'Pago por sesión' }
}

// Nº de clases que incluye cada pack prepagado
export const CLASES_POR_PACK = 6

// En el proyecto Vite esto apunta al icono real servido desde /public.
// En el artifact consolidado este valor se sustituye por un data URI en base64.
export const LOGO_DATA_URI = '/icon-512.png'

export const CURSOS = [
  { label: 'ESO', options: ['1º ESO', '2º ESO', '3º ESO', '4º ESO'] },
  { label: 'Bachillerato', options: [{ v: '1º Bach', t: '1º Bachillerato' }, { v: '2º Bach', t: '2º Bachillerato' }] },
  {
    label: 'Formación Profesional',
    options: [
      { v: 'GM 1º', t: 'Grado Medio — 1º' },
      { v: 'GM 2º', t: 'Grado Medio — 2º' },
      { v: 'GS 1º', t: 'Grado Superior — 1º' },
      { v: 'GS 2º', t: 'Grado Superior — 2º' },
      { v: 'Acceso GS', t: 'Acceso a Grado Superior' }
    ]
  }
]
