export default function Modal({ open, children, align }) {
  return (
    <div className={'modal-bg' + (open ? ' on' : '')} style={align === 'center' ? { alignItems: 'center' } : undefined}>
      <div className="modal">
        <div className="modal-handle"></div>
        {children}
      </div>
    </div>
  )
}
