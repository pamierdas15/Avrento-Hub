import { useState, useRef, useCallback } from 'react'

// showToast(texto) muestra un aviso breve.
// showToast(texto, accion) muestra además un botón (p. ej. "Deshacer"):
//   accion = { label: 'Deshacer', onClick: fn }
// Con botón, el aviso dura más para dar tiempo a pulsarlo.
export function useToast() {
  const [msg, setMsg] = useState('')
  const [accion, setAccion] = useState(null)
  const [show, setShow] = useState(false)
  const timer = useRef(null)

  const ocultar = useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
    setShow(false)
  }, [])

  const showToast = useCallback((text, acc) => {
    setMsg(text)
    setAccion(acc && typeof acc.onClick === 'function' ? acc : null)
    setShow(true)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setShow(false), acc ? 5000 : 2500)
  }, [])

  // Atajo para avisos de borrado: "deshacer" es la función que devuelven
  // las acciones eliminar* de useAppData.
  const toastDeshacer = useCallback((text, deshacer) => {
    showToast(text, {
      label: 'Deshacer',
      onClick: () => { deshacer(); showToast('Restaurado') }
    })
  }, [showToast])

  return { msg, accion, show, showToast, toastDeshacer, ocultar }
}
