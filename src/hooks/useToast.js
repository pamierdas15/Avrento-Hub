import { useState, useRef, useCallback } from 'react'

export function useToast() {
  const [msg, setMsg] = useState('')
  const [show, setShow] = useState(false)
  const timer = useRef(null)

  const showToast = useCallback((text) => {
    setMsg(text)
    setShow(true)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setShow(false), 2500)
  }, [])

  return { msg, show, showToast }
}
