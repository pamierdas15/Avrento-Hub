export default function Toast({ msg, accion, show, onCerrar }) {
  return (
    <div className={'toast' + (show ? ' show' : '') + (accion ? ' toast-accion' : '')}>
      <span>{msg}</span>
      {accion ? (
        <button
          className="toast-btn"
          tabIndex={show ? 0 : -1}
          onClick={() => { onCerrar && onCerrar(); accion.onClick() }}
        >{accion.label}</button>
      ) : null}
    </div>
  )
}
