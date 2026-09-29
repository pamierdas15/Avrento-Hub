import { Home, Users, ClipboardCheck, Wallet, BarChart3 } from 'lucide-react'

const NAV_TABS = [
  { key: 'inicio', label: 'Inicio', Icon: Home },
  { key: 'alumnos', label: 'Alumnos', Icon: Users },
  { key: 'asistencia', label: 'Asistencia', Icon: ClipboardCheck },
  { key: 'pagos', label: 'Pagos', Icon: Wallet },
  { key: 'resumen', label: 'Resumen', Icon: BarChart3 }
]
const NAV_CENTER = Math.floor(NAV_TABS.length / 2)

// La pestaña activa siempre ocupa el slot central (bajo la burbuja/notch);
// el resto se reordena a su alrededor con una transición deslizante.
function centeredSlots(activeKey) {
  const rawIndex = NAV_TABS.findIndex(t => t.key === activeKey)
  const activeIndex = rawIndex === -1 ? 0 : rawIndex
  const n = NAV_TABS.length
  const offset = (activeIndex - NAV_CENTER + n) % n
  const slotOf = {}
  NAV_TABS.forEach((t, i) => {
    slotOf[t.key] = (i - offset + n) % n
  })
  return slotOf
}

export default function TabBar({ active, onChange }) {
  const slots = centeredSlots(active)

  return (
    <nav className="tab-bar">
      <div className="tab-bar-bg" />
      <div className="tab-bar-track">
        {NAV_TABS.map(t => {
          const on = active === t.key
          const slot = slots[t.key]
          return (
            <button
              key={t.key}
              className={'tab-slot' + (on ? ' tab-slot-active' : '')}
              style={{ left: `${slot * (100 / NAV_TABS.length)}%`, width: `${100 / NAV_TABS.length}%` }}
              onClick={() => onChange(t.key)}
            >
              <span className={'tab-icon-wrap' + (on ? ' tab-icon-wrap-active' : '')}>
                <t.Icon size={on ? 22 : 18} strokeWidth={on ? 2.25 : 2} />
              </span>
              {!on ? <span className="tab-label">{t.label}</span> : null}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
