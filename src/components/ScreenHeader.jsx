import { LOGO_DATA_URI } from '../utils/constants'

export default function ScreenHeader({ title }) {
  return (
    <div className="screen-header">
      <img src={LOGO_DATA_URI} className="screen-header-logo" alt="AvrentoHub" />
      <span className="screen-header-title">{title}</span>
    </div>
  )
}
