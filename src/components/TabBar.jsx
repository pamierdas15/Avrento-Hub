import { Home, Users, Calendar, ClipboardCheck, Wallet, BarChart3 } from 'lucide-react'

const TAB_DEFS = [
  { id: 'inicio', label: 'Inicio', Icon: Home },
  { id: 'alumnos', label: 'Alumnos', Icon: Users },
  { id: 'calendario', label: 'Calendario', Icon: Calendar },
  { id: 'asistencia', label: 'Asistencia', Icon: ClipboardCheck },
  { id: 'pagos', label: 'Pagos', Icon: Wallet },
  { id: 'resumen', label: 'Resumen', Icon: BarChart3 }
]

export default function TabBar({ active, onChange }) {
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
