import { LOGO_DATA_URI } from '../utils/constants'

const TAB_TITLES = {
  alumnos: 'Alumnos',
  asistencia: 'Asistencia',
  pagos: 'Pagos',
  resumen: 'Resumen'
}

export default function AppHeader({ tab }) {
  const title = TAB_TITLES[tab]

  return (
    <div className="header-bar">
      <div className="header-bar-bg" />
      <div className="header-bar-content">
        <span className="header-app-pos">
          <span className="logo-text"><span className="logo-avrento">Avrento</span><span className="logo-hub">Hub</span></span>
        </span>
        <span className="header-tab-pos">
          {title ? <span className="page-header-title">{title}</span> : null}
        </span>
      </div>
      <span className="header-icon-wrap">
        <img src={LOGO_DATA_URI} alt="AvrentoHub" />
      </span>
    </div>
  )
}
