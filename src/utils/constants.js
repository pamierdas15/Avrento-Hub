export const SK = 'avrento_hub_v1'
export const WA_SK = 'avrento_wa'
export const FES_SK = 'avrento_festivos'
export const BACKUP_SK = 'avrento_ultimo_backup'

export const DIAS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
export const DIAS_FULL = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
export const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
export const COLORS = ['#2563eb', '#1d9e75', '#7c3aed', '#db2777', '#d97706', '#0891b2', '#059669', '#dc2626']
export const TURNOS = { '17:00': 'T1 · 17–18:30', '18:30': 'T2 · 18:30–20h' }

export const ESTADO_CFG = {
  activo: { bg: 'rgba(52,211,153,0.12)', color: '#34d399', txt: '✓ Activo' },
  pausado: { bg: 'rgba(251,191,36,0.12)', color: '#fbbf24', txt: '⏸ Pausado' },
  baja: { bg: 'rgba(248,113,113,0.12)', color: '#f87171', txt: '✗ Baja' }
}

export const ESTADO_BTN_CFG = {
  activo: { bg: 'rgba(52,211,153,0.1)', color: '#34d399', border: 'rgba(52,211,153,0.4)' },
  pausado: { bg: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: 'rgba(251,191,36,0.4)' },
  baja: { bg: 'rgba(248,113,113,0.1)', color: '#f87171', border: 'rgba(248,113,113,0.4)' }
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
  semana: 'Muy buenas {nombre}. Solo quería recordarte que está pendiente de pago el importe de {importe}, que corresponde a {pendientes}. Gracias de antemano.',
  sesion: 'Muy buenas {nombre}. Solo quería recordarte que está pendiente de pago el importe de {importe}, que corresponde a {pendientes}. Gracias de antemano.'
}

// Modalidades de pago disponibles para un alumno
export const MODALIDAD_CFG = {
  fija: { label: 'Mensual', badgeClass: 'badge-fija', suffix: '/mes', campo: 'tarifa', tarifaLabel: 'Tarifa mensual (€)', selectLabel: 'Pago mensual' },
  semana: { label: 'Semanal', badgeClass: 'badge-semana', suffix: '/sem.', campo: 'precioSemana', tarifaLabel: 'Tarifa semanal (€)', selectLabel: 'Pago semana' },
  sesion: { label: 'Por sesión', badgeClass: 'badge-sesion', suffix: '/ses.', campo: 'precioSesion', tarifaLabel: 'Precio por sesión (€)', selectLabel: 'Pago por sesión' }
}

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
