export default function Modal({ open, children, align }) {
  return (
    <div className={'modal-bg' + (open ? ' on' : '') + (align === 'center' ? ' modal-center' : '')}>
      <div className="modal">
        <div className="modal-handle"></div>
        {children}
      </div>
    </div>
  )
}
