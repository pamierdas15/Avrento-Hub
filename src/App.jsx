import { useState, useEffect, useCallback, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Home, Users, Calendar, ClipboardCheck, Wallet, BarChart3 } from 'lucide-react';

const CSS_TEXT = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Raleway:wght@400;600;700;800&family=Work+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap');

*{box-sizing:border-box;margin:0;padding:0;font-family:'Work Sans',Arial,sans-serif}
html,body{height:100%;background:#04060c;color:#fff}

.app{
  --bg-base:#04060c;
  --line:rgba(255,255,255,0.08);
  --text:#F5F7FF;
  --text-muted:#8A93AD;
  --accent:#4d9fff;
  --accent2:#7c8fff;
  --accent-soft:rgba(77,159,255,0.14);
  --accent-line:rgba(77,159,255,0.32);
  --card-top:#101a33;
  --card-bottom:#070b16;
  --card-top-2:#142244;
  --green:#34d399; --green-soft:rgba(52,211,153,0.14); --green-line:rgba(52,211,153,0.32);
  --red:#f87171; --red-soft:rgba(248,113,113,0.14); --red-line:rgba(248,113,113,0.32);
  --amber:#fbbf24; --amber-soft:rgba(251,191,36,0.14); --amber-line:rgba(251,191,36,0.32);
  --purple:#a78bfa; --purple-soft:rgba(167,139,250,0.14); --purple-line:rgba(167,139,250,0.32);
  width:100%;height:100vh;height:100dvh;display:flex;flex-direction:column;position:relative;overflow:hidden;
  background-color:var(--bg-base);
  background-image:
    radial-gradient(rgba(255,255,255,0.045) 1px, transparent 1.4px),
    radial-gradient(circle at 18% 6%, rgba(77,159,255,0.22), transparent 42%),
    radial-gradient(circle at 88% 88%, rgba(124,143,255,0.14), transparent 46%),
    radial-gradient(120% 60% at 50% -10%, #0d1730 0%, #04060c 55%);
  background-size:26px 26px, auto, auto, auto;
  background-repeat:repeat, no-repeat, no-repeat, no-repeat;
  color:var(--text);
}
.views-wrap{flex:1;min-height:0;position:relative}
.view{display:none;position:absolute;inset:0;overflow-y:auto;padding-bottom:10px;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}
.view.on{display:block}

/* ---- Header de marca (Inicio) ---- */
.app-header{display:flex;align-items:center;gap:12px;padding-top:6px;margin-bottom:20px}
.logo-img{width:42px;height:42px;min-width:42px;border-radius:13px;box-shadow:0 8px 22px rgba(77,159,255,0.35),inset 0 1px 0 rgba(255,255,255,0.25);background:linear-gradient(135deg,#132244,#0a1226)}
.logo-text{font-family:'Bebas Neue',sans-serif;font-size:26px;letter-spacing:0.02em;line-height:1;display:flex}
.logo-avrento{color:#fff}
.logo-hub{color:var(--accent);text-shadow:0 0 22px rgba(77,159,255,0.45)}
.header-eyebrow{margin-left:auto;font-family:'JetBrains Mono',monospace;font-size:9.5px;letter-spacing:0.1em;text-transform:uppercase;color:var(--text-muted);background:var(--accent-soft);border:1px solid var(--accent-line);border-radius:999px;padding:5px 10px}

/* ---- Header del resto de pestañas (logo + título) ---- */
.screen-header{display:flex;align-items:center;gap:10px;margin-bottom:16px}
.screen-header-logo{width:30px;height:30px;min-width:30px;border-radius:9px;box-shadow:0 6px 16px rgba(77,159,255,0.35),inset 0 1px 0 rgba(255,255,255,0.25);background:linear-gradient(135deg,#132244,#0a1226)}
.screen-header-title{font-family:'Raleway',sans-serif;font-weight:400;font-size:21px;letter-spacing:-0.005em;line-height:1.1;color:#fff}

/* ---- Barra inferior con burbuja flotante ---- */
.tab-bar{position:relative;display:flex;height:76px;flex-shrink:0;background:rgba(4,6,12,0.78);backdrop-filter:blur(20px);border-top:1px solid var(--line);padding-bottom:env(safe-area-inset-bottom,0px)}
.tab-slot{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:4px;padding-bottom:11px;border:none;background:transparent;cursor:pointer;-webkit-tap-highlight-color:transparent}
.tab-icon-wrap{display:flex;align-items:center;justify-content:center;width:34px;height:34px;color:var(--text-muted);transition:all 0.25s cubic-bezier(0.34,1.15,0.64,1)}
.tab-icon-wrap-active{width:50px;height:50px;border-radius:50%;margin-top:-26px;background:linear-gradient(135deg,var(--accent),var(--accent2));color:#04070f;box-shadow:0 10px 24px rgba(77,159,255,0.45),inset 0 1px 0 rgba(255,255,255,0.35)}
.tab-label{font-size:9px;color:var(--text-muted);font-weight:500;letter-spacing:0.01em}

.section-pad{padding:16px 14px 0}

/* ---- Tarjetas ---- */
.card{background:linear-gradient(180deg,var(--card-top),var(--card-bottom));border:1px solid var(--line);box-shadow:0 8px 22px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.04);border-radius:16px;padding:14px 16px;margin-bottom:10px;transition:opacity 0.15s;-webkit-tap-highlight-color:transparent}
.card:active{opacity:0.75}
.card-row{display:flex;align-items:center;justify-content:space-between;gap:8px}
.avatar{width:38px;height:38px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:#fff;flex-shrink:0;box-shadow:inset 0 1px 0 rgba(255,255,255,0.2),0 4px 10px rgba(0,0,0,0.35)}
.alumno-name{font-size:14px;font-weight:700;color:#fff}
.alumno-meta{font-size:11px;color:var(--text-muted);margin-top:2px}

.badge{display:inline-block;padding:3px 9px;border-radius:999px;font-size:10px;font-weight:700;font-family:'JetBrains Mono',monospace;letter-spacing:0.02em}
.badge-fija{background:var(--accent-soft);color:var(--accent)}
.badge-semana{background:rgba(45,212,191,0.14);color:#2dd4bf}
.badge-sesion{background:var(--purple-soft);color:var(--purple)}
.badge-pend{background:var(--amber-soft);color:var(--amber)}
.badge-ok{background:var(--green-soft);color:var(--green)}
.badge-aus{background:var(--red-soft);color:var(--red)}
.badge-just{background:var(--accent-soft);color:var(--accent)}

.icon-btn{background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:16px;padding:2px 5px;-webkit-tap-highlight-color:transparent}
.dia-btn{padding:6px 10px;border-radius:20px;border:1px solid var(--line);background:rgba(255,255,255,0.04);font-size:12px;cursor:pointer;color:var(--text-muted);-webkit-tap-highlight-color:transparent}
.dia-btn.on{background:linear-gradient(135deg,var(--accent),#2563eb);color:#fff;border-color:transparent;font-weight:700;box-shadow:0 4px 14px rgba(77,159,255,0.35)}

/* ---- Modales ---- */
.modal-bg{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.65);z-index:20;justify-content:center;align-items:flex-end}
.modal-bg.on{display:flex}
.modal{background:linear-gradient(180deg,#101a33,#070b16);border:1px solid var(--line);border-radius:24px 24px 0 0;padding:18px 16px calc(24px + env(safe-area-inset-bottom,0px));width:100%;max-width:430px;max-height:88vh;overflow-y:auto;box-shadow:0 -10px 40px rgba(0,0,0,0.55)}
.modal-handle{width:36px;height:4px;background:rgba(255,255,255,0.15);border-radius:2px;margin:0 auto 14px}
.modal-title{font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:0.01em;margin-bottom:14px;color:#fff}

.inp-label{font-size:11px;color:rgba(255,255,255,0.7);margin-bottom:4px;display:block}
.inp-row{margin-bottom:10px}
input,select,textarea{width:100%;padding:9px 11px;border:1px solid var(--line);border-radius:10px;font-size:14px;background:rgba(255,255,255,0.05);color:#fff;font-family:'Work Sans',sans-serif;-webkit-appearance:none;appearance:none}
input[type="date"]{color-scheme:dark}
input::placeholder,textarea::placeholder{color:rgba(255,255,255,0.25)}
select option{background:#0f1829;color:#fff}
textarea{height:70px;resize:none}

.btn-primary{width:100%;padding:12px;border-radius:14px;border:none;background:linear-gradient(135deg,var(--accent),#2563eb);color:#fff;font-size:14px;font-weight:700;cursor:pointer;margin-top:6px;transition:opacity 0.15s;-webkit-tap-highlight-color:transparent;box-shadow:0 8px 22px rgba(77,159,255,0.3)}
.btn-primary:active{opacity:0.75}
.btn-secondary{width:100%;padding:11px;border-radius:14px;border:1px solid var(--accent-line);background:transparent;color:var(--accent);font-size:13px;font-weight:700;cursor:pointer;margin-top:8px;transition:opacity 0.15s;-webkit-tap-highlight-color:transparent}
.btn-secondary:active{opacity:0.75}
.btn-danger{width:100%;padding:11px;border-radius:14px;border:none;background:var(--red-soft);color:var(--red);font-size:13px;font-weight:700;cursor:pointer;margin-top:8px;transition:opacity 0.15s;-webkit-tap-highlight-color:transparent}
.btn-danger:active{opacity:0.75}

.empty{text-align:center;padding:2.5rem 0;color:rgba(255,255,255,0.35);font-size:13px}

.seg{display:flex;background:rgba(255,255,255,0.04);border-radius:10px;padding:3px;margin-bottom:12px;border:1px solid var(--line)}
.seg-btn{flex:1;padding:6px;border:none;background:transparent;border-radius:8px;font-size:12px;cursor:pointer;color:var(--text-muted);font-family:'Work Sans',sans-serif;-webkit-tap-highlight-color:transparent}
.seg-btn.on{background:linear-gradient(135deg,var(--accent),#2563eb);color:#fff;font-weight:700;box-shadow:0 4px 14px rgba(77,159,255,0.3)}

.resumen-hero{background:linear-gradient(160deg,#152a52,#0a1226);border:1px solid var(--accent-line);border-radius:20px;padding:20px;margin-bottom:12px;box-shadow:0 10px 30px rgba(0,0,0,0.45),inset 0 1px 0 rgba(255,255,255,0.06)}
.resumen-hero .label{font-family:'JetBrains Mono',monospace;font-size:10.5px;letter-spacing:0.08em;text-transform:uppercase;color:var(--text-muted);margin-bottom:6px}
.resumen-hero .val{font-family:'Bebas Neue',sans-serif;font-size:38px;letter-spacing:0.01em;color:#fff}

.resumen-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px}
.rcard{background:linear-gradient(180deg,var(--card-top-2),var(--card-bottom));border:1px solid var(--line);border-radius:14px;padding:12px;box-shadow:inset 0 1px 0 rgba(255,255,255,0.04)}
.rcard .rl{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.05em;text-transform:uppercase;color:var(--text-muted);margin-bottom:4px}
.rcard .rv{font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:0.01em}
.rv.green{color:var(--green)}
.rv.red{color:var(--red)}
.rv.purple{color:var(--accent)}

.quick-btn{display:flex;flex-direction:column;align-items:center;gap:6px;padding:14px 8px;border-radius:16px;border:1px solid var(--line);background:linear-gradient(180deg,var(--card-top-2),var(--card-bottom));cursor:pointer;transition:opacity 0.15s;-webkit-tap-highlight-color:transparent;box-shadow:0 6px 18px rgba(0,0,0,0.35)}
.quick-btn:active{opacity:0.7}
.quick-btn .qico{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center}

.toast{position:fixed;bottom:calc(70px + env(safe-area-inset-bottom,0px));left:50%;transform:translateX(-50%);background:linear-gradient(135deg,var(--accent),#2563eb);color:#fff;padding:8px 18px;border-radius:20px;font-size:12px;opacity:0;transition:opacity 0.3s;pointer-events:none;white-space:nowrap;z-index:99;box-shadow:0 10px 26px rgba(77,159,255,0.4)}
.toast.show{opacity:1}

.hist-item{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--line)}
.hist-item:last-child{border-bottom:none}

.cal-header{display:flex;align-items:center;justify-content:space-between;padding:14px 14px 8px;gap:6px}
.cal-week-label{font-family:'Bebas Neue',sans-serif;font-size:16px;letter-spacing:0.01em;color:#fff;flex:1;text-align:center}
.cal-nav{width:30px;height:30px;border-radius:50%;border:1px solid var(--line);background:rgba(255,255,255,0.04);cursor:pointer;font-size:16px;color:var(--accent);flex-shrink:0;-webkit-tap-highlight-color:transparent}
.cal-days{display:grid;grid-template-columns:repeat(7,1fr);border-bottom:1px solid var(--line);padding:0 10px}
.cal-day-hdr{text-align:center;font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:600;color:var(--text-muted);padding:4px 0;text-transform:uppercase}
.cal-day-hdr.today-col{color:var(--accent)}
.cal-grid{padding:0 10px 10px}
.cal-slot{min-height:52px;border-bottom:1px solid rgba(255,255,255,0.04);display:flex;flex-direction:column;gap:3px;padding:5px 2px}
.cal-slot:last-child{border-bottom:none}
.cal-event{border-radius:8px;padding:4px 7px;font-size:11px;font-weight:700;cursor:pointer;-webkit-tap-highlight-color:transparent}
.cal-event .ev-name{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
.cal-event .ev-hora{font-size:10px;font-weight:400;opacity:0.7}
.cal-today-dot{width:5px;height:5px;border-radius:50%;background:var(--accent);margin:0 auto 2px}
.cal-empty-msg{text-align:center;padding:2rem 0;color:rgba(255,255,255,0.35);font-size:13px}

.sec-label{font-family:'JetBrains Mono',monospace;font-size:10.5px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px}
.ftipo-btn{padding:7px 12px;border-radius:10px;font-size:12px;cursor:pointer;font-family:'Work Sans',sans-serif;border:1px solid var(--line);background:rgba(255,255,255,0.04);color:var(--text-muted);-webkit-tap-highlight-color:transparent}

`;

// ==== utils/constants.js ====
const SK = 'avrento_hub_v1'
const WA_SK = 'avrento_wa'
const FES_SK = 'avrento_festivos'
const BACKUP_SK = 'avrento_ultimo_backup'

const DIAS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const DIAS_FULL = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const COLORS = ['#2563eb', '#1d9e75', '#7c3aed', '#db2777', '#d97706', '#0891b2', '#059669', '#dc2626']
const TURNOS = { '17:00': 'T1 · 17–18:30', '18:30': 'T2 · 18:30–20h' }

const ESTADO_CFG = {
  activo: { bg: 'rgba(52,211,153,0.12)', color: '#34d399', txt: '✓ Activo' },
  pausado: { bg: 'rgba(251,191,36,0.12)', color: '#fbbf24', txt: '⏸ Pausado' },
  baja: { bg: 'rgba(248,113,113,0.12)', color: '#f87171', txt: '✗ Baja' }
}

const ESTADO_BTN_CFG = {
  activo: { bg: 'rgba(52,211,153,0.1)', color: '#34d399', border: 'rgba(52,211,153,0.4)' },
  pausado: { bg: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: 'rgba(251,191,36,0.4)' },
  baja: { bg: 'rgba(248,113,113,0.1)', color: '#f87171', border: 'rgba(248,113,113,0.4)' }
}

const FEST_CFG = {
  festivo: { ico: '🎉', label: 'Festivo', color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.25)' },
  vacaciones: { ico: '🏖', label: 'Vacaciones', color: '#34d399', bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.25)' },
  ausencia: { ico: '🤒', label: 'Ausencia docente', color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.25)' }
}

const FTIPO_BTN_CFG = {
  festivo: { bg: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: 'rgba(251,191,36,0.4)' },
  vacaciones: { bg: 'rgba(52,211,153,0.12)', color: '#34d399', border: 'rgba(52,211,153,0.4)' },
  ausencia: { bg: 'rgba(248,113,113,0.12)', color: '#f87171', border: 'rgba(248,113,113,0.4)' }
}

// Plantillas de recordatorio de WhatsApp según la modalidad de pago del alumno.
// Placeholders disponibles en las tres: {nombre}, {importe}, {pendientes}
const WA_DEFAULTS = {
  fija: 'Muy buenas {nombre}. Solo quería recordarte que está pendiente de pago el mes de {pendientes}, con un importe de {importe}. Gracias de antemano.',
  semana: 'Muy buenas {nombre}. Solo quería recordarte que está pendiente de pago el importe de {importe}, que corresponde a {pendientes}. Gracias de antemano.',
  sesion: 'Muy buenas {nombre}. Solo quería recordarte que está pendiente de pago el importe de {importe}, que corresponde a {pendientes}. Gracias de antemano.'
}

// Modalidades de pago disponibles para un alumno
const MODALIDAD_CFG = {
  fija: { label: 'Mensual', badgeClass: 'badge-fija', suffix: '/mes', campo: 'tarifa', tarifaLabel: 'Tarifa mensual (€)', selectLabel: 'Pago mensual' },
  semana: { label: 'Semanal', badgeClass: 'badge-semana', suffix: '/sem.', campo: 'precioSemana', tarifaLabel: 'Tarifa semanal (€)', selectLabel: 'Pago semana' },
  sesion: { label: 'Por sesión', badgeClass: 'badge-sesion', suffix: '/ses.', campo: 'precioSesion', tarifaLabel: 'Precio por sesión (€)', selectLabel: 'Pago por sesión' }
}

// En el proyecto Vite esto apunta al icono real servido desde /public.
// En el artifact consolidado este valor se sustituye por un data URI en base64.
const LOGO_DATA_URI = 'data:image/png;base64,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'

const CURSOS = [
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

// ==== utils/helpers.js ====
const todayStr = () => new Date().toISOString().slice(0, 10)

const fmt = n => (+n).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'

const initials = n => n.trim().split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()

const alumnoColor = idx => COLORS[idx % COLORS.length]

function getWeekDates(off) {
  const now = new Date()
  const day = now.getDay()
  const mon = new Date(now)
  mon.setDate(now.getDate() - ((day === 0 ? 7 : day) - 1) + (off * 7))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mon)
    d.setDate(mon.getDate() + i)
    return d
  })
}

// ==== utils/business.js ====
function inicioSemana(d) {
  const dd = new Date(d)
  const dow = dd.getDay()
  dd.setDate(dd.getDate() - ((dow === 0 ? 7 : dow) - 1))
  dd.setHours(0, 0, 0, 0)
  return dd
}

function pagoEnRango(pagos, alumnoId, desde, hasta) {
  return pagos.some(p => {
    if (p.alumnoId !== alumnoId || p.tipo !== 'recibido') return false
    const f = new Date(p.fecha + 'T12:00:00')
    return f >= desde && f <= hasta
  })
}

// Fecha desde la que cuenta el conteo de pendientes: la de alta, o la de la
// última reactivación si el alumno estuvo pausado/de baja y volvió a activo.
function inicioConteo(alumno) {
  return alumno.activoDesde || alumno.alta || todayStr()
}

// Sesiones "presente" cuya fecha ya ha pasado (no cuentan las de hoy ni futuras)
// y que son posteriores al inicio del conteo vigente para el alumno.
function sesionesPasadas(d, alumno) {
  const hoyISO = todayStr()
  const desde = inicioConteo(alumno)
  return d.sesiones.filter(s => s.alumnoId === alumno.id && s.estado === 'presente' && s.fecha < hoyISO && s.fecha >= desde)
}

function capitaliza(s) { return s.charAt(0).toUpperCase() + s.slice(1) }

// Mientras un alumno está pausado o de baja, no se genera ningún pago pendiente nuevo.
function conteoParalizado(alumno) {
  return alumno.estado === 'pausado' || alumno.estado === 'baja'
}

// ---- Periodos pendientes por modalidad (fuente única de verdad) ----

function pendientesMensuales(d, alumno) {
  if (conteoParalizado(alumno)) return []
  const hoy = new Date()
  const desde = inicioConteo(alumno)
  const inicio = new Date(desde + 'T12:00:00')
  let y = inicio.getFullYear(), m = inicio.getMonth()
  const limitY = hoy.getFullYear(), limitM = hoy.getMonth()
  const incluyeMesActual = hoy.getDate() > 15
  const out = []
  let guard = 0
  while ((y < limitY || (y === limitY && m <= limitM)) && guard < 24) {
    const esMesActual = y === limitY && m === limitM
    if (!esMesActual || incluyeMesActual) {
      const ok = d.pagos.some(p => {
        if (p.alumnoId !== alumno.id || p.tipo !== 'recibido') return false
        const f = new Date(p.fecha + 'T12:00:00')
        return f.getFullYear() === y && f.getMonth() === m
      })
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
    }
    m++; if (m > 11) { m = 0; y++ }
    guard++
  }
  return out
}

function pendientesSemanales(d, alumno) {
  if (conteoParalizado(alumno)) return []
  const hoy = new Date()
  const hoyLunes = inicioSemana(hoy)
  const ultimoLunes = new Date(hoyLunes); ultimoLunes.setDate(hoyLunes.getDate() - 7)
  let inicio = inicioSemana(new Date(inicioConteo(alumno) + 'T12:00:00'))
  const maxLookbackMs = 12 * 7 * 24 * 60 * 60 * 1000
  if (ultimoLunes - inicio > maxLookbackMs) inicio = new Date(ultimoLunes.getTime() - maxLookbackMs)
  const out = []
  let cursor = new Date(inicio)
  let guard = 0
  while (cursor <= ultimoLunes && guard < 20) {
    const domingo = new Date(cursor); domingo.setDate(cursor.getDate() + 6); domingo.setHours(23, 59, 59, 999)
    const ok = pagoEnRango(d.pagos, alumno.id, cursor, domingo)
    if (!ok) {
      const periodo = `la semana del ${cursor.getDate()} al ${domingo.getDate()} de ${MESES[domingo.getMonth()]}`
      out.push({
        value: cursor.toISOString().slice(0, 10),
        label: `${cursor.getDate()} ${MESES[cursor.getMonth()].substring(0, 3)} — ${domingo.getDate()} ${MESES[domingo.getMonth()].substring(0, 3)} · ${fmt(alumno.precioSemana)}`,
        importe: alumno.precioSemana,
        periodo,
        concepto: `Semana del ${cursor.getDate()} al ${domingo.getDate()} de ${MESES[domingo.getMonth()]}`
      })
    }
    cursor = new Date(cursor); cursor.setDate(cursor.getDate() + 7)
    guard++
  }
  return out
}

function pendientesSesiones(d, alumno) {
  if (conteoParalizado(alumno)) return []
  const desde = inicioConteo(alumno)
  const ses = sesionesPasadas(d, alumno).length
  const total = d.pagos
    .filter(p => p.alumnoId === alumno.id && p.tipo === 'recibido' && p.fecha >= desde)
    .reduce((s, p) => s + p.importe, 0)
  const pag = alumno.precioSesion > 0 ? Math.floor(total / alumno.precioSesion) : 0
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

// Lista de periodos pendientes de cobro para un alumno, según su modalidad de pago.
// Cada elemento sirve para rellenar el formulario de "Registrar pago" con un clic.
function getPendientesDetalle(d, alumno) {
  if (!alumno) return []
  if (alumno.modalidad === 'fija') return pendientesMensuales(d, alumno)
  if (alumno.modalidad === 'semana') return pendientesSemanales(d, alumno)
  return pendientesSesiones(d, alumno)
}

// Resumen único de lo pendiente de un alumno: nº de periodos, importe total,
// y texto legible de a qué corresponde (usado en alertas y en WhatsApp)
function getResumenPendiente(d, alumno) {
  if (!alumno || conteoParalizado(alumno)) return { count: 0, importe: 0, texto: '' }
  if (alumno.modalidad === 'fija') {
    const items = pendientesMensuales(d, alumno)
    const importe = items.reduce((s, it) => s + it.importe, 0)
    const texto = items.map(it => it.periodo).join(' y ')
    return { count: items.length, importe, texto }
  }
  if (alumno.modalidad === 'semana') {
    const items = pendientesSemanales(d, alumno)
    const importe = items.reduce((s, it) => s + it.importe, 0)
    const texto = items.map(it => it.periodo).join(' y ')
    return { count: items.length, importe, texto }
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
function getAlertas(d) {
  const res = []
  d.alumnos.forEach(a => {
    if (conteoParalizado(a)) return
    const resumen = getResumenPendiente(d, a)
    if (resumen.count > 0) res.push({ nombre: a.nombre, count: resumen.count })
  })
  return res
}

// Importe pendiente formateado para un alumno concreto (usado en la info de pago)
function getPendienteFmt(d, alumnoId) {
  const a = d.alumnos.find(x => x.id === alumnoId)
  if (!a) return '0,00 €'
  return fmt(getResumenPendiente(d, a).importe)
}

// ==== components/Modal.jsx ====
function Modal({ open, children, align }) {
  return (
    <div className={'modal-bg' + (open ? ' on' : '')} style={align === 'center' ? { alignItems: 'center' } : undefined}>
      <div className="modal">
        <div className="modal-handle"></div>
        {children}
      </div>
    </div>
  )
}

// ==== components/Toast.jsx ====
function Toast({ msg, show }) {
  return <div className={'toast' + (show ? ' show' : '')}>{msg}</div>
}

// ==== components/ScreenHeader.jsx ====
function ScreenHeader({ title }) {
  return (
    <div className="screen-header">
      <img src={LOGO_DATA_URI} className="screen-header-logo" alt="AvrentoHub" />
      <span className="screen-header-title">{title}</span>
    </div>
  )
}

// ==== components/modals/AlumnoModal.jsx ====
const DIAS_BTNS = [
  { v: '1', t: 'Lun' }, { v: '2', t: 'Mar' }, { v: '3', t: 'Mié' }, { v: '4', t: 'Jue' },
  { v: '5', t: 'Vie' }, { v: '6', t: 'Sáb' }, { v: '0', t: 'Dom' }
]

const BLANK = {
  id: '', nombre: '', curso: '1º ESO', materia: '', estado: 'activo', alta: todayStr(),
  dias: [], hora: '', modalidad: 'fija', tarifa: '', precioSemana: '', precioSesion: '', notas: ''
}

function AlumnoModal({ open, editing, onClose, onSave, onDelete, showToast }) {
  const [form, setForm] = useState(BLANK)

  useEffect(() => {
    if (open) setForm(editing ? { ...BLANK, ...editing } : BLANK)
  }, [open, editing])

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }
  function toggleDia(v) {
    setForm(f => ({ ...f, dias: f.dias.includes(v) ? f.dias.filter(x => x !== v) : [...f.dias, v] }))
  }

  function guardar() {
    if (!form.nombre.trim()) { showToast('Introduce el nombre'); return }
    const reactivando = form.estado === 'activo' && editing && editing.estado !== 'activo'
    const activoDesde = reactivando
      ? todayStr()
      : (editing?.activoDesde || form.alta || todayStr())
    onSave({
      id: form.id || Date.now().toString(),
      nombre: form.nombre.trim(),
      curso: form.curso,
      materia: form.materia.trim(),
      estado: form.estado,
      alta: form.alta,
      activoDesde,
      dias: form.dias,
      hora: form.hora,
      modalidad: form.modalidad,
      tarifa: parseFloat(form.tarifa) || 0,
      precioSemana: parseFloat(form.precioSemana) || 0,
      precioSesion: parseFloat(form.precioSesion) || 0,
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
          <option value="semana">{MODALIDAD_CFG.semana.selectLabel}</option>
          <option value="sesion">{MODALIDAD_CFG.sesion.selectLabel}</option>
        </select>
      </div>

      <div className="inp-row">
        <label className="inp-label">{modCfg.tarifaLabel}</label>
        <input type="number" placeholder="0,00" step="0.01" min="0" value={form[modCfg.campo]} onChange={e => set(modCfg.campo, e.target.value)} />
      </div>

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

// ==== components/modals/DetalleModal.jsx ====
function DetalleModal({ open, alumnoId, data, onClose, onEditar }) {
  if (!open || !alumnoId) return <Modal open={open}><button className="btn-secondary" onClick={onClose}>Cerrar</button></Modal>
  const a = data.alumnos.find(x => x.id === alumnoId)
  if (!a) return <Modal open={open}><button className="btn-secondary" onClick={onClose}>Cerrar</button></Modal>

  const idx = data.alumnos.indexOf(a)
  const ses = data.sesiones.filter(s => s.alumnoId === alumnoId)
  const pres = ses.filter(s => s.estado === 'presente').length
  const aus = ses.filter(s => s.estado === 'ausente').length
  const just = ses.filter(s => s.estado === 'justificada').length
  const cobrado = data.pagos.filter(p => p.alumnoId === alumnoId && p.tipo === 'recibido').reduce((s, p) => s + p.importe, 0)
  const pendiente = data.pagos.filter(p => p.alumnoId === alumnoId && p.tipo === 'pendiente').reduce((s, p) => s + p.importe, 0)
  const eb = ESTADO_CFG[a.estado || 'activo']

  return (
    <Modal open={open}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div className="avatar" style={{ width: 48, height: 48, fontSize: 18, borderRadius: 14, background: alumnoColor(idx) }}>{initials(a.nombre)}</div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{a.nombre}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{a.curso || ''}{a.materia ? ' · ' + a.materia : ''}</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
            <span className={'badge ' + MODALIDAD_CFG[a.modalidad || 'fija'].badgeClass}>
              {MODALIDAD_CFG[a.modalidad || 'fija'].label} · {fmt(a[MODALIDAD_CFG[a.modalidad || 'fija'].campo]) + MODALIDAD_CFG[a.modalidad || 'fija'].suffix}
            </span>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: eb.bg, color: eb.color }}>{eb.txt}</span>
          </div>
          {a.alta ? <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>Alta: {new Date(a.alta + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</div> : null}
        </div>
      </div>

      {a.notas ? <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.05)', padding: '8px 10px', borderRadius: 8, marginBottom: 12 }}>{a.notas}</div> : null}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 10 }}>
        <div className="rcard"><div className="rl">Presentes</div><div className="rv green">{pres}</div></div>
        <div className="rcard"><div className="rl">Ausentes</div><div className="rv red">{aus}</div></div>
        <div className="rcard"><div className="rl">Justif.</div><div className="rv purple">{just}</div></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
        <div className="rcard"><div className="rl">Cobrado</div><div className="rv green">{fmt(cobrado)}</div></div>
        <div className="rcard"><div className="rl">Pendiente</div><div className="rv red">{fmt(pendiente)}</div></div>
      </div>

      <button className="btn-primary" onClick={() => onEditar(a.id)}>Editar datos</button>
      <button className="btn-secondary" onClick={onClose}>Cerrar</button>
    </Modal>
  )
}

// ==== components/modals/EventoModal.jsx ====
function EventoModal({ open, alumnoId, fecha, data, onClose, onRegistrar }) {
  if (!open || !alumnoId) return <Modal open={open}><button className="btn-secondary" onClick={onClose}>Cerrar</button></Modal>
  const { alumnos, sesiones } = data
  const a = alumnos.find(x => x.id === alumnoId)
  if (!a) return <Modal open={open}><button className="btn-secondary" onClick={onClose}>Cerrar</button></Modal>

  const idx = alumnos.indexOf(a)
  const ses = sesiones.find(s => s.alumnoId === alumnoId && s.fecha === fecha)
  const fechaFmt = new Date(fecha + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <Modal open={open}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div className="avatar" style={{ width: 40, height: 40, fontSize: 15, borderRadius: 11, background: alumnoColor(idx) }}>{initials(a.nombre)}</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{a.nombre}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{a.curso || ''}{a.materia ? ' · ' + a.materia : ''}</div>
        </div>
      </div>
      <div className="rcard" style={{ marginBottom: 10 }}>
        <div className="rl">Fecha</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', textTransform: 'capitalize' }}>{fechaFmt}{a.hora ? ' · ' + a.hora : ''}</div>
      </div>
      <div className="rcard" style={{ marginBottom: 14 }}>
        <div className="rl">Asistencia</div>
        <div style={{ marginTop: 4 }}>
          {ses
            ? <span className={'badge badge-' + ses.estado}>{ses.estado === 'presente' ? '✓ Presente' : ses.estado === 'ausente' ? '✗ Ausente' : '↩ Justificada'}</span>
            : <span className="badge" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}>Sin registrar</span>}
        </div>
      </div>
      {!ses ? (
        <>
          <button className="btn-primary" style={{ marginTop: 0 }} onClick={() => onRegistrar(alumnoId, fecha, 'presente')}>✓ Marcar presente</button>
          <button className="btn-secondary" onClick={() => onRegistrar(alumnoId, fecha, 'ausente')}>✗ Marcar ausente</button>
        </>
      ) : null}
      <button className="btn-secondary" onClick={onClose} style={{ marginTop: 10 }}>Cerrar</button>
    </Modal>
  )
}

// ==== components/modals/VerFestivoModal.jsx ====
function VerFestivoModal({ open, fecha, festivo, data, onClose, onEliminar }) {
  if (!open || !festivo) return <Modal open={open}><button className="btn-secondary" onClick={onClose}>Cerrar</button></Modal>
  const fc = FEST_CFG[festivo.tipo]
  const dia = new Date(fecha + 'T12:00:00')
  const diaStr = dia.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const afectados = data.alumnos.filter(a => (a.dias || []).includes(String(dia.getDay())))

  return (
    <Modal open={open}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: fc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{fc.ico}</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: fc.color }}>{fc.label}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', textTransform: 'capitalize' }}>{diaStr}</div>
          {festivo.nota ? <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{festivo.nota}</div> : null}
        </div>
      </div>

      {afectados.length ? (
        <>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>⚠ Alumnos afectados</div>
          {afectados.map(a => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: 'rgba(255,255,255,0.04)', borderRadius: 10, marginBottom: 6 }}>
              <div className="avatar" style={{ width: 28, height: 28, fontSize: 10, borderRadius: 8, background: alumnoColor(data.alumnos.indexOf(a)) }}>{initials(a.nombre)}</div>
              <span style={{ fontSize: 13, color: '#fff' }}>{a.nombre}</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginLeft: 'auto' }}>{TURNOS[a.hora] || a.hora || ''}</span>
            </div>
          ))}
        </>
      ) : null}

      <button className="btn-danger" style={{ marginTop: 8 }} onClick={() => onEliminar(fecha)}>Desbloquear este día</button>
      <button className="btn-secondary" onClick={onClose}>Cerrar</button>
    </Modal>
  )
}

// ==== components/modals/FestivoModal.jsx ====
const TIPOS = [
  { v: 'festivo', label: '🎉 Festivo' },
  { v: 'vacaciones', label: '🏖 Vacaciones' },
  { v: 'ausencia', label: '🤒 Ausencia' }
]

function FestivoModal({ open, data, onClose, onGuardar, showToast }) {
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

// ==== components/modals/AlertasModal.jsx ====
function AlertasModal({ open, alertas, onClose }) {
  return (
    <Modal open={open}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(251,191,36,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⚠️</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Alertas de pago</div>
      </div>

      {alertas.map((al, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'rgba(251,191,36,0.08)', borderRadius: 12, marginBottom: 8, borderLeft: '3px solid #fbbf24' }}>
          <div style={{ fontSize: 20 }}>⚠️</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
            {al.nombre} — {al.count} pago{al.count > 1 ? 's' : ''} pendiente{al.count > 1 ? 's' : ''}
          </div>
        </div>
      ))}

      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textAlign: 'center', marginTop: 4, marginBottom: 8 }}>
        {alertas.length} alumno{alertas.length > 1 ? 's' : ''} con pagos pendientes
      </div>

      <button className="btn-secondary" onClick={onClose}>Entendido</button>
    </Modal>
  )
}

// ==== views/Inicio.jsx ====
function Inicio({ data, esFestivo, registrarSesion, showToast, onGoTab, onNuevoAlumno, onVerAlertas }) {
  const hoy = new Date()
  const hoyISO = todayStr()
  const dsHoy = hoy.getDay()
  const alertas = getAlertas(data)

  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedIdx, setSelectedIdx] = useState(dsHoy === 0 ? 6 : dsHoy - 1)
  const touchX = useRef(null)

  const sem = getWeekDates(weekOffset)
  const selDate = sem[selectedIdx]
  const selISO = selDate.toISOString().slice(0, 10)
  const selDow = selDate.getDay()
  const esSelHoy = selISO === hoyISO
  const nombreDiaSel = esSelHoy ? 'Hoy' : selDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
  const fesSel = esFestivo(selISO)

  const clasesDia = data.alumnos
    .filter(a => (a.dias || []).includes(String(selDow)))
    .sort((a, b) => (a.hora || '').localeCompare(b.hora || ''))

  const m1 = sem[0], m7 = sem[6]
  const weekLabel = `${m1.getDate()} ${MESES[m1.getMonth()].substring(0, 3)} — ${m7.getDate()} ${MESES[m7.getMonth()].substring(0, 3)}`

  function cambiarSemana(dir) {
    setWeekOffset(o => o + dir)
  }

  function irAHoy() {
    setWeekOffset(0)
    setSelectedIdx(dsHoy === 0 ? 6 : dsHoy - 1)
  }

  function onTouchStart(e) { touchX.current = e.touches[0].clientX }
  function onTouchEnd(e) {
    if (touchX.current == null) return
    const dx = e.changedTouches[0].clientX - touchX.current
    if (Math.abs(dx) > 40) cambiarSemana(dx < 0 ? 1 : -1)
    touchX.current = null
  }

  function regDesdeInicio(alumnoId) {
    const ok = registrarSesion(alumnoId, selISO, 'presente')
    if (ok) showToast('Asistencia registrada')
  }

  return (
    <div className="section-pad">
      <div className="app-header">
        <img src={LOGO_DATA_URI} className="logo-img" alt="AvrentoHub" />
        <div className="logo-text"><span className="logo-avrento">Avrento</span><span className="logo-hub">Hub</span></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 18 }}>
        <button className="quick-btn" onClick={onNuevoAlumno}>
          <div className="qico" style={{ background: 'rgba(37,99,235,0.2)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4d9fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>Nuevo alumno</span>
        </button>
        <button className="quick-btn" onClick={() => onGoTab('asistencia')}>
          <div className="qico" style={{ background: 'rgba(29,158,117,0.2)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>Reg. clase</span>
        </button>
        <button className="quick-btn" onClick={() => onGoTab('pagos')}>
          <div className="qico" style={{ background: 'rgba(124,58,237,0.2)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>Reg. pago</span>
        </button>
      </div>

      {alertas.length ? (
        <div
          style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 14, padding: '12px 14px', marginBottom: 16, cursor: 'pointer' }}
          onClick={onVerAlertas}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: '#fbbf24', marginBottom: 4 }}>⚠ {alertas.length} alerta{alertas.length > 1 ? 's' : ''} de pago</div>
          {alertas.slice(0, 2).map((al, i) => (
            <div key={i} style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>
              · {al.nombre} — {al.count} pago{al.count > 1 ? 's' : ''} pendiente{al.count > 1 ? 's' : ''}
            </div>
          ))}
          {alertas.length > 2 ? <div style={{ fontSize: 11, color: '#fbbf24', marginTop: 2 }}>Ver todas →</div> : null}
        </div>
      ) : (
        <div style={{ background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.15)', borderRadius: 14, padding: '10px 14px', marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#34d399' }}>✓ Sin alertas de pago pendientes</div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div className="sec-label" style={{ marginBottom: 0 }}>Semana · <span style={{ textTransform: 'none' }}>{weekLabel}</span></div>
        {weekOffset !== 0 ? (
          <button onClick={irAHoy} style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', background: 'var(--accent-soft)', border: '1px solid var(--accent-line)', borderRadius: 999, padding: '3px 9px', cursor: 'pointer' }}>Hoy</button>
        ) : null}
      </div>

      <div
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '10px 6px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 2, touchAction: 'pan-y' }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <button onClick={() => cambiarSemana(-1)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 16, padding: '0 4px', cursor: 'pointer', flexShrink: 0 }}>‹</button>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, flex: 1 }}>
          {sem.map((dia, i) => {
            const iso = dia.toISOString().slice(0, 10)
            const esH = iso === hoyISO
            const esSel = i === selectedIdx
            const tieneC = data.alumnos.some(a => (a.dias || []).includes(String(dia.getDay())))
            const fes = esFestivo(iso)
            return (
              <button key={i} onClick={() => setSelectedIdx(i)} style={{ textAlign: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0' }}>
                <div style={{ fontSize: 9, color: esSel ? '#4d9fff' : 'rgba(255,255,255,0.4)', fontWeight: esSel || esH ? 700 : 400, textTransform: 'uppercase' }}>{DIAS_ES[dia.getDay()]}</div>
                <div style={{ width: 28, height: 28, borderRadius: '50%', margin: '3px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', background: esSel ? 'linear-gradient(135deg,#1a4fd6,#2563eb)' : 'transparent', border: esSel ? 'none' : esH ? '1px solid rgba(77,159,255,0.5)' : '1px solid rgba(255,255,255,0.08)', boxShadow: esSel ? '0 4px 12px rgba(77,159,255,0.4)' : 'none' }}>
                  <span style={{ fontSize: 11, fontWeight: esSel ? 700 : 400, color: esSel ? '#fff' : esH ? '#4d9fff' : 'rgba(255,255,255,0.65)' }}>{dia.getDate()}</span>
                </div>
                {fes
                  ? <div style={{ fontSize: 10, textAlign: 'center' }}>{FEST_CFG[fes.tipo].ico}</div>
                  : tieneC
                    ? <div style={{ width: 4, height: 4, borderRadius: '50%', background: esSel ? '#4d9fff' : 'rgba(77,159,255,0.5)', margin: '2px auto' }}></div>
                    : <div style={{ height: 6 }}></div>}
              </button>
            )
          })}
        </div>
        <button onClick={() => cambiarSemana(1)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 16, padding: '0 4px', cursor: 'pointer', flexShrink: 0 }}>›</button>
      </div>

      <div className="sec-label">Clases · <span style={{ textTransform: 'capitalize', fontWeight: 400, color: 'rgba(255,255,255,0.45)' }}>{nombreDiaSel}</span></div>
      {fesSel ? (
        <div className="empty">{FEST_CFG[fesSel.tipo].ico} {FEST_CFG[fesSel.tipo].label}{fesSel.nota ? ' · ' + fesSel.nota : ''}</div>
      ) : clasesDia.length ? clasesDia.map(a => {
        const idx = data.alumnos.indexOf(a)
        const sesH = data.sesiones.find(s => s.alumnoId === a.id && s.fecha === selISO)
        const tc = a.hora === '17:00' ? { border: 'rgba(77,159,255,0.5)', text: '#4d9fff' } : a.hora === '18:30' ? { border: 'rgba(251,146,60,0.5)', text: '#fb923c' } : { border: 'rgba(255,255,255,0.15)', text: 'rgba(255,255,255,0.7)' }
        return (
          <div className="card" key={a.id} style={{ borderLeft: '3px solid ' + tc.border }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="avatar" style={{ width: 36, height: 36, fontSize: 12, borderRadius: 10, background: alumnoColor(idx) }}>{initials(a.nombre)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{a.nombre}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>
                  {a.curso || ''}{a.hora ? <> · <span style={{ color: tc.text }}>{TURNOS[a.hora] || a.hora}</span></> : null}
                </div>
              </div>
              {sesH
                ? <span className={'badge badge-' + sesH.estado}>{sesH.estado === 'presente' ? '✓ Pres.' : sesH.estado === 'ausente' ? '✗ Aus.' : '↩ Just.'}</span>
                : <button onClick={() => regDesdeInicio(a.id)} style={{ padding: '6px 10px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#1a4fd6,#2563eb)', color: '#fff', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>Registrar</button>}
            </div>
          </div>
        )
      }) : <div className="empty">No hay clases programadas ese día</div>}
    </div>
  )
}

// ==== views/Alumnos.jsx ====
function Alumnos({ data, onNuevoAlumno, onVerDetalle }) {
  const [termino, setTermino] = useState('')
  const { alumnos } = data
  const t = termino.toLowerCase().trim()
  const lista = alumnos.filter(a =>
    !t ||
    a.nombre.toLowerCase().includes(t) ||
    (a.curso || '').toLowerCase().includes(t) ||
    (a.materia || '').toLowerCase().includes(t)
  )

  return (
    <div className="section-pad">
      <ScreenHeader title="Alumnos" />
      <button onClick={onNuevoAlumno} className="btn-primary" style={{ marginTop: 0, marginBottom: 12 }}>Nuevo Alumno</button>
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" placeholder="Buscar alumno..." value={termino} onChange={e => setTermino(e.target.value)} style={{ paddingLeft: 34 }} />
      </div>

      {!alumnos.length
        ? <p className="empty">Sin alumnos registrados.</p>
        : !lista.length
          ? <p className="empty">Sin resultados.</p>
          : lista.map(a => {
            const idx = alumnos.indexOf(a)
            const eb = ESTADO_CFG[a.estado || 'activo']
            return (
              <div className="card" key={a.id} onClick={() => onVerDetalle(a.id)} style={a.estado === 'baja' ? { opacity: 0.45 } : undefined}>
                <div className="card-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                    <div className="avatar" style={{ background: alumnoColor(idx) }}>{initials(a.nombre)}</div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <div className="alumno-name">{a.nombre}</div>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 10, background: eb.bg, color: eb.color }}>{eb.txt}</span>
                      </div>
                      <div className="alumno-meta">
                        {a.curso || ''}{a.materia ? ' · ' + a.materia : ''}
                        {(a.dias || []).length ? ' · ' + (a.dias || []).map(d => DIAS_FULL[parseInt(d)]).join(', ') : ''}
                        {a.hora ? ' · ' + (TURNOS[a.hora] || a.hora) : ''}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                    <span className={'badge ' + MODALIDAD_CFG[a.modalidad || 'fija'].badgeClass}>{MODALIDAD_CFG[a.modalidad || 'fija'].label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#4d9fff' }}>{fmt(a[MODALIDAD_CFG[a.modalidad || 'fija'].campo]) + MODALIDAD_CFG[a.modalidad || 'fija'].suffix}</span>
                  </div>
                </div>
              </div>
            )
          })}
    </div>
  )
}

// ==== views/Calendario.jsx ====
function Calendario({ data, esFestivo, onVerEvento, onVerFestivo, onAbrirFestivo }) {
  const [offset, setOffset] = useState(0)
  const dates = getWeekDates(offset)
  const todayISO = todayStr()
  const { alumnos } = data
  const m1 = dates[0], m7 = dates[6]
  const label = `${m1.getDate()} ${MESES[m1.getMonth()].substring(0, 3)} — ${m7.getDate()} ${MESES[m7.getMonth()].substring(0, 3)} ${m7.getFullYear()}`

  const dayMap = {}
  dates.forEach(d => { dayMap[d.getDay()] = [] })
  alumnos.forEach((a, idx) => {
    ;(a.dias || (a.dia ? [a.dia] : [])).forEach(ds => {
      const dn = parseInt(ds)
      if (dayMap[dn] !== undefined) dayMap[dn].push({ ...a, colorIdx: idx })
    })
  })

  return (
    <>
      <div className="section-pad" style={{ paddingBottom: 0 }}>
        <ScreenHeader title="Calendario" />
      </div>
      <div className="cal-header">
        <button className="cal-nav" onClick={() => setOffset(o => o - 1)}>‹</button>
        <span className="cal-week-label">{label}</span>
        <button className="cal-nav" onClick={() => setOffset(o => o + 1)}>›</button>
        <button onClick={onAbrirFestivo} style={{ padding: '5px 10px', borderRadius: 10, border: '1px solid rgba(251,191,36,0.3)', background: 'rgba(251,191,36,0.08)', color: '#fbbf24', fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>+ Festivo</button>
      </div>

      <div className="cal-days">
        {dates.map((d, i) => {
          const iso = d.toISOString().slice(0, 10)
          const isT = iso === todayISO
          return (
            <div className={'cal-day-hdr' + (isT ? ' today-col' : '')} key={i}>
              {isT ? <div className="cal-today-dot"></div> : null}
              <div>{DIAS_ES[d.getDay()]}</div>
              <div style={{ fontSize: 11, fontWeight: isT ? 700 : 400, color: isT ? '#4d9fff' : 'rgba(255,255,255,0.35)' }}>{d.getDate()}</div>
            </div>
          )
        })}
      </div>

      <div className="cal-grid">
        {!alumnos.length ? (
          <p className="cal-empty-msg">Añade alumnos con día y hora para ver el calendario.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3 }}>
            {dates.map((d, i) => {
              const eventos = dayMap[d.getDay()] || []
              const iso = d.toISOString().slice(0, 10)
              const isT = iso === todayISO
              const fes = esFestivo(iso)
              if (fes) {
                const fc = FEST_CFG[fes.tipo]
                return (
                  <div key={i} className="cal-slot" style={{ background: fc.bg, border: '1px solid ' + fc.border, borderRadius: 8, cursor: 'pointer', alignItems: 'center', justifyContent: 'center' }} onClick={() => onVerFestivo(iso)}>
                    <div style={{ textAlign: 'center', padding: '4px 0' }}>
                      <div style={{ fontSize: 16 }}>{fc.ico}</div>
                      <div style={{ fontSize: 8, color: fc.color, fontWeight: 700, textTransform: 'uppercase', marginTop: 2 }}>{fes.tipo.substring(0, 3)}</div>
                    </div>
                  </div>
                )
              }
              return (
                <div key={i} className="cal-slot" style={isT ? { background: 'rgba(37,99,235,0.08)', borderRadius: 8 } : undefined}>
                  {['17:00', '18:30'].map(turno => {
                    const tc = turno === '17:00' ? { bg: 'rgba(77,159,255,0.12)', border: '#4d9fff', text: '#4d9fff' } : { bg: 'rgba(251,146,60,0.12)', border: '#fb923c', text: '#fb923c' }
                    const arr = eventos.filter(a => a.hora === turno)
                    if (!arr.length) {
                      return <div key={turno} style={{ minHeight: 22, borderRadius: 6, background: tc.bg, marginBottom: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 9, color: tc.border + '55' }}>{turno}</span></div>
                    }
                    return arr.map(a => (
                      <div className="cal-event" key={a.id + turno} style={{ background: tc.bg, borderLeft: '2px solid ' + tc.border, marginBottom: 3 }} onClick={() => onVerEvento(a.id, iso)}>
                        <div className="ev-name" style={{ color: tc.text }}>{a.nombre.split(' ')[0]}</div>
                        <div className="ev-hora" style={{ color: tc.text }}>{turno}</div>
                      </div>
                    ))
                  })}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}

// ==== views/Asistencia.jsx ====
function Asistencia({ data, registrarSesion, eliminarSesion, showToast }) {
  const { alumnos } = data
  const [alumnoId, setAlumnoId] = useState(alumnos[0]?.id || '')
  const [fecha, setFecha] = useState(todayStr())
  const [estado, setEstado] = useState('presente')

  function guardar() {
    if (!alumnoId || !fecha) { showToast('Selecciona alumno y fecha'); return }
    const ok = registrarSesion(alumnoId, fecha, estado)
    showToast(ok ? 'Asistencia registrada' : 'Ya existe un registro para esta fecha')
  }

  const ses = data.sesiones.filter(s => s.alumnoId === alumnoId).slice().sort((a, b) => b.fecha.localeCompare(a.fecha))

  return (
    <div className="section-pad">
      <ScreenHeader title="Asistencia" />
      <div className="inp-row">
        <label className="inp-label">Alumno</label>
        <select value={alumnoId} onChange={e => setAlumnoId(e.target.value)}>
          {alumnos.length
            ? alumnos.map(a => <option value={a.id} key={a.id}>{a.nombre}</option>)
            : <option value="">Sin alumnos</option>}
        </select>
      </div>
      <div className="inp-row">
        <label className="inp-label">Fecha</label>
        <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} />
      </div>
      <div className="seg">
        <button className={'seg-btn' + (estado === 'presente' ? ' on' : '')} onClick={() => setEstado('presente')}>✓ Presente</button>
        <button className={'seg-btn' + (estado === 'ausente' ? ' on' : '')} onClick={() => setEstado('ausente')}>✗ Ausente</button>
        <button className={'seg-btn' + (estado === 'justificada' ? ' on' : '')} onClick={() => setEstado('justificada')}>↩ Just.</button>
      </div>
      <button className="btn-primary" onClick={guardar}>Registrar asistencia</button>

      <div style={{ marginTop: 14 }}>
        {!alumnoId ? null : !ses.length ? (
          <p className="empty">Sin sesiones registradas</p>
        ) : (
          <>
            <div className="sec-label" style={{ marginTop: 4 }}>Historial</div>
            {ses.map(s => (
              <div className="hist-item" key={s.id}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{new Date(s.fecha + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
                </div>
                <span className={'badge badge-' + s.estado}>{s.estado === 'presente' ? '✓ Presente' : s.estado === 'ausente' ? '✗ Ausente' : '↩ Justificada'}</span>
                <button className="icon-btn" onClick={() => eliminarSesion(s.id)}>✕</button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}

// ==== views/Pagos.jsx ====
function Pagos({ data, registrarPago, eliminarPago, showToast, onAbrirWhatsapp }) {
  const { alumnos } = data
  const [alumnoId, setAlumnoId] = useState(alumnos[0]?.id || '')
  const [tipo, setTipo] = useState('recibido')
  const [importe, setImporte] = useState('')
  const [concepto, setConcepto] = useState('')
  const [fecha, setFecha] = useState(todayStr())

  const alumno = alumnos.find(a => a.id === alumnoId)
  const modCfg = alumno ? MODALIDAD_CFG[alumno.modalidad || 'fija'] : null
  const pendientes = alumno ? getPendientesDetalle(data, alumno) : []

  useEffect(() => {
    if (alumno && modCfg) setImporte(String(alumno[modCfg.campo] || ''))
  }, [alumnoId]) // eslint-disable-line react-hooks/exhaustive-deps

  function aplicarPendiente(value) {
    const item = pendientes.find(p => p.value === value)
    if (!item) return
    setImporte(String(item.importe))
    setConcepto(item.concepto)
    setTipo('recibido')
  }

  function guardar() {
    const imp = parseFloat(importe)
    if (!alumnoId || !imp || !fecha) { showToast('Rellena todos los campos'); return }
    registrarPago({ alumnoId, importe: +imp.toFixed(2), concepto: concepto.trim() || 'Pago', fecha, tipo })
    setConcepto('')
    showToast('Pago registrado')
  }

  const pagos = data.pagos.filter(p => p.alumnoId === alumnoId).slice().sort((a, b) => b.fecha.localeCompare(a.fecha))

  return (
    <div className="section-pad">
      <ScreenHeader title="Pagos" />
      <div className="inp-row">
        <label className="inp-label">Alumno</label>
        <select value={alumnoId} onChange={e => setAlumnoId(e.target.value)}>
          {alumnos.length
            ? alumnos.map(a => <option value={a.id} key={a.id}>{a.nombre}</option>)
            : <option value="">Sin alumnos</option>}
        </select>
      </div>

      {alumno && modCfg ? (
        <div style={{ marginBottom: 10 }}>
          <div className="card" style={{ padding: '10px 12px', background: 'rgba(37,99,235,0.1)', borderColor: 'rgba(77,159,255,0.2)' }}>
            <span className={'badge ' + modCfg.badgeClass}>{modCfg.label}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#4d9fff', marginLeft: 8 }}>{fmt(alumno[modCfg.campo]) + ' ' + modCfg.suffix}</span>
          </div>
        </div>
      ) : null}

      <div className="seg">
        <button className={'seg-btn' + (tipo === 'recibido' ? ' on' : '')} onClick={() => setTipo('recibido')}>✓ Cobrado</button>
        <button className={'seg-btn' + (tipo === 'pendiente' ? ' on' : '')} onClick={() => setTipo('pendiente')}>⏳ Pendiente</button>
      </div>
      <div className="inp-row">
        <label className="inp-label">Importe (€)</label>
        <input type="number" placeholder="0,00" step="0.01" min="0" value={importe} onChange={e => setImporte(e.target.value)} />
      </div>

      {alumno && modCfg ? (
        <div className="inp-row">
          <label className="inp-label">Tipo de pago del alumno</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 11px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, background: 'rgba(255,255,255,0.05)' }}>
            <span className={'badge ' + modCfg.badgeClass}>{modCfg.label}</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{modCfg.selectLabel}</span>
          </div>
        </div>
      ) : null}

      {alumno && pendientes.length ? (
        <div className="inp-row">
          <label className="inp-label">Pagos pendientes</label>
          <select value="" onChange={e => aplicarPendiente(e.target.value)}>
            <option value="">{pendientes.length} pendiente{pendientes.length > 1 ? 's' : ''} · Seleccionar...</option>
            {pendientes.map(p => <option value={p.value} key={p.value}>{p.label}</option>)}
          </select>
        </div>
      ) : null}

      <div className="inp-row">
        <label className="inp-label">Concepto</label>
        <input type="text" placeholder="Ej: Mensualidad junio..." value={concepto} onChange={e => setConcepto(e.target.value)} />
      </div>
      <div className="inp-row">
        <label className="inp-label">Fecha</label>
        <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} />
      </div>
      <button className="btn-primary" onClick={guardar}>Registrar pago</button>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '16px 0' }}></div>

      <button onClick={onAbrirWhatsapp} style={{ width: '100%', padding: 11, borderRadius: 14, border: '1px solid rgba(37,211,102,0.3)', background: 'rgba(37,211,102,0.08)', color: '#25d366', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#25d366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        Enviar recordatorio WhatsApp
      </button>

      <div style={{ marginTop: 14 }}>
        {!alumnoId ? null : !pagos.length ? (
          <p className="empty">Sin pagos registrados</p>
        ) : (
          <>
            <div className="sec-label" style={{ marginTop: 4 }}>Historial</div>
            {pagos.map(p => (
              <div className="hist-item" key={p.id}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{p.concepto}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>{new Date(p.fecha + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                </div>
                <span className={'badge ' + (p.tipo === 'recibido' ? 'badge-ok' : 'badge-pend')} style={{ marginRight: 6 }}>{fmt(p.importe)}</span>
                <button className="icon-btn" onClick={() => eliminarPago(p.id)}>✕</button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}

// ==== views/Resumen.jsx ====
function Resumen({ data, onAbrirBackup, showToast }) {
  const hoy = new Date(), mes = hoy.getMonth(), anyo = hoy.getFullYear()
  const cobradoMes = data.pagos.filter(p => { const f = new Date(p.fecha + 'T12:00:00'); return p.tipo === 'recibido' && f.getMonth() === mes && f.getFullYear() === anyo }).reduce((s, p) => s + p.importe, 0)
  const pendienteTotal = data.pagos.filter(p => p.tipo === 'pendiente').reduce((s, p) => s + p.importe, 0)
  const totalSes = data.sesiones.length
  const pres = data.sesiones.filter(s => s.estado === 'presente').length
  const mesLabel = hoy.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })

  const mesesSet = new Set([`${anyo}-${String(mes + 1).padStart(2, '0')}`])
  data.pagos.forEach(p => { const f = new Date(p.fecha + 'T12:00:00'); mesesSet.add(`${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}`) })

  function exportExcel() {
    if (!data.alumnos.length) { showToast('No hay datos para exportar'); return }
    const wb = XLSX.utils.book_new()
    const ws1 = XLSX.utils.json_to_sheet(data.alumnos.map(a => {
      const modCfg = MODALIDAD_CFG[a.modalidad || 'fija']
      return {
        'Nombre': a.nombre, 'Curso': a.curso || '', 'Materia': a.materia || '', 'Estado': a.estado || 'activo',
        'Fecha alta': a.alta || '', 'Días': (a.dias || []).map(x => DIAS_FULL[parseInt(x)]).join(', '),
        'Turno': TURNOS[a.hora] || a.hora || '', 'Modalidad': modCfg.selectLabel,
        'Tarifa (€)': a[modCfg.campo]
      }
    }))
    XLSX.utils.book_append_sheet(wb, ws1, 'Alumnos')

    const asR = data.sesiones.slice().sort((a, b) => a.fecha.localeCompare(b.fecha)).map(s => {
      const al = data.alumnos.find(a => a.id === s.alumnoId)
      return { 'Alumno': al ? al.nombre : '?', 'Curso': al ? al.curso || '' : '', 'Fecha': s.fecha, 'Estado': s.estado }
    })
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(asR.length ? asR : [{ 'Alumno': 'Sin datos', 'Fecha': '', 'Estado': '' }]), 'Asistencia')

    const paR = data.pagos.slice().sort((a, b) => a.fecha.localeCompare(b.fecha)).map(p => {
      const al = data.alumnos.find(a => a.id === p.alumnoId)
      return { 'Alumno': al ? al.nombre : '?', 'Fecha': p.fecha, 'Concepto': p.concepto, 'Tipo': p.tipo === 'recibido' ? 'Cobrado' : 'Pendiente', 'Importe (€)': p.tipo === 'recibido' ? p.importe : -p.importe }
    })
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(paR.length ? paR : [{ 'Alumno': 'Sin datos', 'Fecha': '', 'Concepto': '', 'Tipo': '', 'Importe (€)': 0 }]), 'Pagos')

    const mS = new Set()
    data.pagos.forEach(p => { const f = new Date(p.fecha + 'T12:00:00'); mS.add(`${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}`) })
    const rR = [...mS].sort().map(mk => {
      const [ay, am] = mk.split('-').map(Number)
      const cob = data.pagos.filter(p => { const f = new Date(p.fecha + 'T12:00:00'); return p.tipo === 'recibido' && f.getMonth() === am - 1 && f.getFullYear() === ay }).reduce((s, p) => s + p.importe, 0)
      const pen = data.pagos.filter(p => { const f = new Date(p.fecha + 'T12:00:00'); return p.tipo === 'pendiente' && f.getMonth() === am - 1 && f.getFullYear() === ay }).reduce((s, p) => s + p.importe, 0)
      return { 'Mes': new Date(ay, am - 1, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }), 'Cobrado (€)': cob, 'Pendiente (€)': pen, 'Balance (€)': cob - pen }
    })
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rR.length ? rR : [{ 'Mes': 'Sin datos', 'Cobrado (€)': 0, 'Pendiente (€)': 0, 'Balance (€)': 0 }]), 'Resumen mensual')

    XLSX.writeFile(wb, `AvrentoHub_${todayStr()}.xlsx`)
    showToast('Excel exportado')
  }

  return (
    <div className="section-pad">
      <ScreenHeader title="Resumen" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
        <button onClick={exportExcel} style={{ padding: 10, borderRadius: 12, border: '1px solid rgba(77,159,255,0.25)', background: 'rgba(77,159,255,0.08)', color: '#4d9fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Exportar Excel
        </button>
        <button onClick={onAbrirBackup} style={{ padding: 10, borderRadius: 12, border: '1px solid rgba(124,58,237,0.25)', background: 'rgba(124,58,237,0.08)', color: '#a78bfa', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>Backup
        </button>
      </div>

      <div className="resumen-hero"><div className="label">Cobrado en {mesLabel}</div><div className="val">{fmt(cobradoMes)}</div></div>

      <div className="resumen-grid">
        <div className="rcard"><div className="rl">Pendiente total</div><div className="rv red">{fmt(pendienteTotal)}</div></div>
        <div className="rcard"><div className="rl">Alumnos</div><div className="rv purple">{data.alumnos.length}</div></div>
        <div className="rcard"><div className="rl">Sesiones</div><div className="rv purple">{totalSes}</div></div>
        <div className="rcard"><div className="rl">Asistencia</div><div className="rv green">{totalSes ? Math.round(pres / totalSes * 100) : 0}%</div></div>
      </div>

      <div className="sec-label">Histórico mensual</div>
      {[...mesesSet].sort((a, b) => b.localeCompare(a)).map(mk => {
        const [ay, am] = mk.split('-').map(Number)
        const esA = am - 1 === mes && ay === anyo
        const label = new Date(ay, am - 1, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
        const cob = data.pagos.filter(p => { const f = new Date(p.fecha + 'T12:00:00'); return p.tipo === 'recibido' && f.getMonth() === am - 1 && f.getFullYear() === ay }).reduce((s, p) => s + p.importe, 0)
        const pen = data.pagos.filter(p => { const f = new Date(p.fecha + 'T12:00:00'); return p.tipo === 'pendiente' && f.getMonth() === am - 1 && f.getFullYear() === ay }).reduce((s, p) => s + p.importe, 0)
        return (
          <div className="card" key={mk} style={esA ? { borderColor: 'rgba(77,159,255,0.3)', background: 'rgba(37,99,235,0.08)' } : undefined}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', textTransform: 'capitalize' }}>
              {label}{esA ? <span style={{ fontSize: 10, background: 'rgba(77,159,255,0.2)', color: '#4d9fff', padding: '1px 6px', borderRadius: 10, marginLeft: 4 }}>Actual</span> : null}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 4, fontSize: 12 }}>
              <span style={{ color: '#34d399', fontWeight: 700 }}>{fmt(cob)}</span>
              {pen > 0 ? <span style={{ color: '#f87171', fontWeight: 700 }}>{fmt(pen)} pend.</span> : null}
            </div>
          </div>
        )
      })}

      <div className="sec-label" style={{ marginTop: 8 }}>Por alumno (este mes)</div>
      {data.alumnos.length ? data.alumnos.map((a, idx) => {
        const ses = data.sesiones.filter(s => s.alumnoId === a.id)
        const presA = ses.filter(s => s.estado === 'presente').length
        const cobA = data.pagos.filter(p => { const f = new Date(p.fecha + 'T12:00:00'); return p.alumnoId === a.id && p.tipo === 'recibido' && f.getMonth() === mes && f.getFullYear() === anyo }).reduce((s, p) => s + p.importe, 0)
        const pendA = data.pagos.filter(p => p.alumnoId === a.id && p.tipo === 'pendiente').reduce((s, p) => s + p.importe, 0)
        return (
          <div className="card" key={a.id}>
            <div className="card-row" style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="avatar" style={{ width: 30, height: 30, fontSize: 11, borderRadius: 8, background: alumnoColor(idx) }}>{initials(a.nombre)}</div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{a.nombre}</span>
              </div>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>{presA}/{ses.length} ses.</span>
            </div>
            <div style={{ display: 'flex', gap: 10, fontSize: 12 }}>
              <span style={{ color: '#34d399', fontWeight: 700 }}>{fmt(cobA)} cobrado</span>
              {pendA > 0 ? <span style={{ color: '#f87171', fontWeight: 700 }}>{fmt(pendA)} pend.</span> : null}
            </div>
          </div>
        )
      }) : <p className="empty">Sin datos aún</p>}
    </div>
  )
}

// ==== components/TabBar.jsx (rediseño premium) ====
const TAB_DEFS = [
  { id: 'inicio', label: 'Inicio', Icon: Home },
  { id: 'alumnos', label: 'Alumnos', Icon: Users },
  { id: 'calendario', label: 'Calendario', Icon: Calendar },
  { id: 'asistencia', label: 'Asistencia', Icon: ClipboardCheck },
  { id: 'pagos', label: 'Pagos', Icon: Wallet },
  { id: 'resumen', label: 'Resumen', Icon: BarChart3 }
]

function TabBar({ active, onChange }) {
  return (
    <nav className="tab-bar">
      {TAB_DEFS.map(t => {
        const on = active === t.id
        return (
          <button key={t.id} className="tab-slot" onClick={() => onChange(t.id)}>
            <span className={'tab-icon-wrap' + (on ? ' tab-icon-wrap-active' : '')}>
              <t.Icon size={on ? 22 : 18} strokeWidth={on ? 2.25 : 2} />
            </span>
            {!on ? <span className="tab-label">{t.label}</span> : null}
          </button>
        )
      })}
    </nav>
  )
}

// ==== components/modals/WhatsappModal.jsx (adaptado sin localStorage, con plantillas por modalidad) ====
function WhatsappModal({ open, data, onClose, showToast, templates, onSaveTemplate }) {
  const { alumnos } = data
  const [alumnoId, setAlumnoId] = useState('')
  const [plantilla, setPlantilla] = useState('')

  useEffect(() => {
    if (open) {
      const primero = alumnos[0]?.id || ''
      setAlumnoId(primero)
      const a = alumnos.find(x => x.id === primero)
      setPlantilla(a ? templates[a.modalidad || 'fija'] : '')
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const alumno = alumnos.find(a => a.id === alumnoId)
  const modalidad = alumno ? (alumno.modalidad || 'fija') : 'fija'

  function seleccionarAlumno(id) {
    setAlumnoId(id)
    const a = alumnos.find(x => x.id === id)
    if (a) setPlantilla(templates[a.modalidad || 'fija'])
  }

  const resumen = alumno ? getResumenPendiente(data, alumno) : { importe: 0, texto: '' }
  const preview = alumno
    ? plantilla
        .replace(/{nombre}/g, alumno.nombre)
        .replace(/{importe}/g, resumen.importe.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €')
        .replace(/{pendientes}/g, resumen.texto || 'sin pagos pendientes')
    : '—'

  function guardarPlantilla() {
    if (!plantilla.trim()) { showToast('La plantilla no puede estar vacía'); return }
    onSaveTemplate(modalidad, plantilla)
    showToast('Plantilla guardada')
  }

  function enviar() {
    if (!alumnoId) { showToast('Selecciona un alumno'); return }
    onSaveTemplate(modalidad, plantilla)
    window.open('https://wa.me/?text=' + encodeURIComponent(preview), '_blank')
    onClose()
  }

  return (
    <Modal open={open}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(37,211,102,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>💬</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Recordatorio de pago</div>
      </div>

      <div className="inp-row">
        <label className="inp-label">Alumno</label>
        <select value={alumnoId} onChange={e => seleccionarAlumno(e.target.value)}>
          {alumnos.map(a => <option value={a.id} key={a.id}>{a.nombre}</option>)}
        </select>
      </div>

      <div className="inp-row">
        <label className="inp-label">Plantilla <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>(usa {'{nombre}'}, {'{importe}'} y {'{pendientes}'})</span></label>
        <textarea style={{ height: 100, fontSize: 13 }} value={plantilla} onChange={e => setPlantilla(e.target.value)}></textarea>
      </div>

      <div style={{ background: 'rgba(37,211,102,0.06)', border: '1px solid rgba(37,211,102,0.15)', borderRadius: 12, padding: 12, marginBottom: 12 }}>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Vista previa</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{preview}</div>
      </div>

      <button onClick={enviar} style={{ width: '100%', padding: 12, borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#128c3e,#25d366)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 0 }}>📲 Abrir WhatsApp</button>
      <button className="btn-secondary" onClick={guardarPlantilla}>💾 Guardar plantilla de esta modalidad</button>
      <button className="btn-secondary" onClick={onClose} style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)' }}>Cancelar</button>
    </Modal>
  )
}

// ==== components/modals/BackupModal.jsx (adaptado sin localStorage) ====
function BackupModal({ open, data, onClose, onRestaurar, showToast, ultimoBackup, onBackupDone }) {
  function exportBackup() {
    const b = { version: 1, fecha: new Date().toISOString(), app: 'AvrentoHub', data }
    const blob = new Blob([JSON.stringify(b, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `AvrentoHub_backup_${todayStr()}.json`
    a.click()
    URL.revokeObjectURL(url)
    onBackupDone(new Date().toISOString())
    showToast('Backup descargado')
  }

  function importBackup(e) {
    const file = e.target.files[0]
    if (!file) return
    const r = new FileReader()
    r.onload = ev => {
      try {
        const b = JSON.parse(ev.target.result)
        if (!b.app || b.app !== 'AvrentoHub' || !b.data) { showToast('Archivo no válido'); return }
        if (!confirm(`¿Restaurar backup del ${new Date(b.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}?`)) return
        onRestaurar(b.data)
        onClose()
        showToast('Datos restaurados')
      } catch {
        showToast('Error al leer el archivo')
      }
    }
    r.readAsText(file)
    e.target.value = ''
  }

  const ultimoTxt = ultimoBackup
    ? 'Último backup: ' + new Date(ultimoBackup).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Aún no has creado ningún backup'

  return (
    <Modal open={open}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(77,159,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🔒</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Copia de seguridad</div>
      </div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 14 }}>Guarda tus datos para restaurarlos si la app pierde la información.</div>
      <button className="btn-primary" onClick={exportBackup} style={{ marginTop: 0 }}>⬇ Descargar backup JSON</button>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textAlign: 'center', margin: '6px 0 12px' }}>{ultimoTxt}</div>
      <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: 12 }}></div>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Restaurar copia</div>
      <label style={{ display: 'block', width: '100%', padding: 11, borderRadius: 14, border: '1px solid rgba(77,159,255,0.4)', color: '#4d9fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', textAlign: 'center' }}>
        📂 Seleccionar archivo backup
        <input type="file" accept=".json" onChange={importBackup} style={{ display: 'none' }} />
      </label>
      <button className="btn-secondary" onClick={onClose}>Cerrar</button>
    </Modal>
  )
}

// ==== App (adaptado para artifact: estado en memoria) ====
function useAppDataMemory() {
  const [data, setData] = useState({ alumnos: [], sesiones: [], pagos: [] })
  const [festivos, setFestivos] = useState([])

  const guardarAlumno = useCallback((alumno) => {
    setData(d => {
      const idx = d.alumnos.findIndex(a => a.id === alumno.id)
      const alumnos = idx > -1
        ? d.alumnos.map((a, i) => i === idx ? { ...a, ...alumno } : a)
        : [...d.alumnos, alumno]
      return { ...d, alumnos }
    })
  }, [])

  const eliminarAlumno = useCallback((id) => {
    setData(d => ({
      alumnos: d.alumnos.filter(a => a.id !== id),
      sesiones: d.sesiones.filter(s => s.alumnoId !== id),
      pagos: d.pagos.filter(p => p.alumnoId !== id)
    }))
  }, [])

  const registrarSesion = useCallback((alumnoId, fecha, estado) => {
    let ok = true
    setData(d => {
      if (d.sesiones.find(s => s.alumnoId === alumnoId && s.fecha === fecha)) { ok = false; return d }
      return { ...d, sesiones: [...d.sesiones, { id: Date.now().toString(), alumnoId, fecha, estado }] }
    })
    return ok
  }, [])

  const eliminarSesion = useCallback((id) => {
    setData(d => ({ ...d, sesiones: d.sesiones.filter(s => s.id !== id) }))
  }, [])

  const registrarPago = useCallback((pago) => {
    setData(d => ({ ...d, pagos: [...d.pagos, { id: Date.now().toString(), ...pago }] }))
  }, [])

  const eliminarPago = useCallback((id) => {
    setData(d => ({ ...d, pagos: d.pagos.filter(p => p.id !== id) }))
  }, [])

  const guardarFestivo = useCallback((festivo) => {
    setFestivos(f => [...f.filter(x => x.fecha !== festivo.fecha), festivo])
  }, [])

  const eliminarFestivo = useCallback((fecha) => {
    setFestivos(f => f.filter(x => x.fecha !== fecha))
  }, [])

  const esFestivo = useCallback((iso) => festivos.find(f => f.fecha === iso) || null, [festivos])

  const restaurarBackup = useCallback((nuevaData) => setData(nuevaData), [])

  return {
    data, festivos, esFestivo, guardarAlumno, eliminarAlumno,
    registrarSesion, eliminarSesion, registrarPago, eliminarPago,
    guardarFestivo, eliminarFestivo, restaurarBackup
  }
}

function useToast() {
  const [msg, setMsg] = useState('')
  const [show, setShow] = useState(false)
  const timer = useRef(null)
  const showToast = useCallback((text) => {
    setMsg(text); setShow(true)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setShow(false), 2500)
  }, [])
  return { msg, show, showToast }
}

export default function App() {
  const store = useAppDataMemory()
  const { data, esFestivo } = store
  const { msg, show, showToast } = useToast()

  const [tab, setTab] = useState('inicio')
  const [alumnoModalOpen, setAlumnoModalOpen] = useState(false)
  const [editingAlumno, setEditingAlumno] = useState(null)
  const [detalleId, setDetalleId] = useState(null)
  const [evento, setEvento] = useState(null)
  const [verFestivoFecha, setVerFestivoFecha] = useState(null)
  const [festivoModalOpen, setFestivoModalOpen] = useState(false)
  const [alertasOpen, setAlertasOpen] = useState(false)
  const [backupOpen, setBackupOpen] = useState(false)
  const [waOpen, setWaOpen] = useState(false)
  const [waTemplates, setWaTemplates] = useState({ ...WA_DEFAULTS })
  const [ultimoBackup, setUltimoBackup] = useState(null)
  const notified = useRef(false)

  useEffect(() => {
    if (notified.current) return
    notified.current = true
    showToast('Datos en memoria: se perderán al recargar')
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const abrirNuevoAlumno = useCallback(() => { setEditingAlumno(null); setAlumnoModalOpen(true) }, [])
  const abrirEditarAlumno = useCallback((id) => {
    const a = data.alumnos.find(x => x.id === id)
    setDetalleId(null); setEditingAlumno(a || null); setAlumnoModalOpen(true)
  }, [data.alumnos])

  function guardarAlumno(alumno) {
    const esNuevo = !editingAlumno
    store.guardarAlumno(alumno)
    setAlumnoModalOpen(false)
    showToast(esNuevo ? 'Alumno añadido' : 'Alumno actualizado')
  }

  function eliminarAlumno(id) {
    if (!confirm('¿Eliminar este alumno y todos sus datos?')) return
    store.eliminarAlumno(id)
    setAlumnoModalOpen(false)
    showToast('Alumno eliminado')
  }

  function registrarSesionYAvisar(alumnoId, fecha, estado) {
    const ok = store.registrarSesion(alumnoId, fecha, estado)
    if (ok) { setEvento(null); showToast('Asistencia registrada') }
    return ok
  }

  function guardarFestivo(festivo) {
    store.guardarFestivo(festivo)
    setFestivoModalOpen(false)
    showToast('Día bloqueado')
  }

  function eliminarFestivo(fecha) {
    store.eliminarFestivo(fecha)
    setVerFestivoFecha(null)
    showToast('Día desbloqueado')
  }

  const alertasActuales = getAlertas(data)

  function renderView() {
    switch (tab) {
      case 'inicio':
        return (
          <Inicio
            data={data}
            esFestivo={esFestivo}
            registrarSesion={store.registrarSesion}
            showToast={showToast}
            onGoTab={setTab}
            onNuevoAlumno={abrirNuevoAlumno}
            onVerAlertas={() => setAlertasOpen(true)}
          />
        )
      case 'alumnos':
        return <Alumnos data={data} onNuevoAlumno={abrirNuevoAlumno} onVerDetalle={setDetalleId} />
      case 'calendario':
        return (
          <Calendario
            data={data}
            esFestivo={esFestivo}
            onVerEvento={(alumnoId, fecha) => setEvento({ alumnoId, fecha })}
            onVerFestivo={setVerFestivoFecha}
            onAbrirFestivo={() => setFestivoModalOpen(true)}
          />
        )
      case 'asistencia':
        return <Asistencia data={data} registrarSesion={store.registrarSesion} eliminarSesion={store.eliminarSesion} showToast={showToast} />
      case 'pagos':
        return <Pagos data={data} registrarPago={store.registrarPago} eliminarPago={store.eliminarPago} showToast={showToast} onAbrirWhatsapp={() => setWaOpen(true)} />
      case 'resumen':
        return <Resumen data={data} onAbrirBackup={() => setBackupOpen(true)} showToast={showToast} />
      default:
        return null
    }
  }

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', justifyContent: 'center', background: '#000' }}>
      <style>{CSS_TEXT}</style>
      <div className="app" style={{ maxWidth: 430, width: '100%' }}>
        <div className="views-wrap">
          <div className="view on">{renderView()}</div>
        </div>
        <TabBar active={tab} onChange={setTab} />

        <AlumnoModal
          open={alumnoModalOpen}
          editing={editingAlumno}
          onClose={() => setAlumnoModalOpen(false)}
          onSave={guardarAlumno}
          onDelete={eliminarAlumno}
          showToast={showToast}
        />
        <DetalleModal open={!!detalleId} alumnoId={detalleId} data={data} onClose={() => setDetalleId(null)} onEditar={abrirEditarAlumno} />
        <EventoModal open={!!evento} alumnoId={evento?.alumnoId} fecha={evento?.fecha} data={data} onClose={() => setEvento(null)} onRegistrar={registrarSesionYAvisar} />
        <VerFestivoModal open={!!verFestivoFecha} fecha={verFestivoFecha} festivo={verFestivoFecha ? esFestivo(verFestivoFecha) : null} data={data} onClose={() => setVerFestivoFecha(null)} onEliminar={eliminarFestivo} />
        <FestivoModal open={festivoModalOpen} data={data} onClose={() => setFestivoModalOpen(false)} onGuardar={guardarFestivo} showToast={showToast} />
        <AlertasModal open={alertasOpen} alertas={alertasActuales} onClose={() => setAlertasOpen(false)} />
        <BackupModal
          open={backupOpen}
          data={data}
          onClose={() => setBackupOpen(false)}
          onRestaurar={store.restaurarBackup}
          showToast={showToast}
          ultimoBackup={ultimoBackup}
          onBackupDone={setUltimoBackup}
        />
        <WhatsappModal
          open={waOpen}
          data={data}
          onClose={() => setWaOpen(false)}
          showToast={showToast}
          templates={waTemplates}
          onSaveTemplate={(modalidad, texto) => setWaTemplates(t => ({ ...t, [modalidad]: texto }))}
        />
        <Toast msg={msg} show={show} />
      </div>
    </div>
  )
}

