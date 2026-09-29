import { useState, useEffect, useCallback } from 'react'
import TabBar from './components/TabBar.jsx'
import Toast from './components/Toast.jsx'
import Inicio from './views/Inicio.jsx'
import Alumnos from './views/Alumnos.jsx'
import Asistencia from './views/Asistencia.jsx'
import Pagos from './views/Pagos.jsx'
import Resumen from './views/Resumen.jsx'
import AlumnoModal from './components/modals/AlumnoModal.jsx'
import DetalleModal from './components/modals/DetalleModal.jsx'
import AlertasModal from './components/modals/AlertasModal.jsx'
import BackupModal from './components/modals/BackupModal.jsx'
import WhatsappModal from './components/modals/WhatsappModal.jsx'
import { useAppData } from './hooks/useAppData.js'
import { useToast } from './hooks/useToast.js'
import { getAlertas } from './utils/business.js'
import { BACKUP_SK, AUTO_BACKUP_SK } from './utils/constants.js'
import { descargarBackup } from './utils/backup.js'
import { todayStr } from './utils/helpers.js'

export default function App() {
  const store = useAppData()
  const { data, esFestivo } = store
  const { msg, show, showToast } = useToast()

  const [tab, setTab] = useState('inicio')

  // Modal: alumno (crear/editar)
  const [alumnoModalOpen, setAlumnoModalOpen] = useState(false)
  const [editingAlumno, setEditingAlumno] = useState(null)

  // Modal: detalle
  const [detalleId, setDetalleId] = useState(null)

  // Modal: alertas
  const [alertasOpen, setAlertasOpen] = useState(false)

  // Modal: backup
  const [backupOpen, setBackupOpen] = useState(false)

  // Modal: whatsapp
  const [waOpen, setWaOpen] = useState(false)

  // Alumno a preseleccionar al entrar en Pagos desde el hero de Inicio
  const [pagosPreselect, setPagosPreselect] = useState(null)

  useEffect(() => {
    if (tab !== 'pagos') setPagosPreselect(null)
  }, [tab])

  useEffect(() => {
    // Alerta automática al entrar (equivalente a checkAlertas() original)
    const alertas = getAlertas(data)
    if (alertas.length) setAlertasOpen(true)

    // Pide al navegador almacenamiento "persistente": reduce el riesgo de que
    // borre los datos del sitio automáticamente por falta de espacio.
    if (navigator.storage && navigator.storage.persist) {
      navigator.storage.persist().catch(() => {})
    }

    // Backup automático: descarga un .json a Descargas, como máximo 1 vez al día.
    // Se puede desactivar desde Resumen → Backup.
    const autoOn = localStorage.getItem(AUTO_BACKUP_SK) !== 'off'
    const hayDatos = data.alumnos.length || data.pagos.length || data.sesiones.length
    if (autoOn && hayDatos) {
      const ultimo = localStorage.getItem(BACKUP_SK)
      const yaHoy = ultimo && ultimo.slice(0, 10) === todayStr()
      if (!yaHoy) {
        descargarBackup(data)
        localStorage.setItem(BACKUP_SK, new Date().toISOString())
        showToast('📥 Backup automático guardado en Descargas')
      }
    } else {
      // Aviso si hace mucho que no hay backup y el automático está desactivado
      const u = localStorage.getItem(BACKUP_SK)
      if (u) {
        const dias = Math.floor((new Date() - new Date(u)) / (1000 * 60 * 60 * 24))
        if (dias >= 7) showToast('⚠ Hace ' + dias + ' días del último backup')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const abrirNuevoAlumno = useCallback(() => { setEditingAlumno(null); setAlumnoModalOpen(true) }, [])
  const abrirEditarAlumno = useCallback((id) => {
    const a = data.alumnos.find(x => x.id === id)
    setDetalleId(null)
    setEditingAlumno(a || null)
    setAlumnoModalOpen(true)
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

  const alertasActuales = getAlertas(data)

  function irAPago(alumnoId) {
    setPagosPreselect(alumnoId)
    setTab('pagos')
  }

  function renderView() {
    switch (tab) {
      case 'inicio':
        return (
          <Inicio
            data={data}
            esFestivo={esFestivo}
            registrarSesion={store.registrarSesion}
            guardarTarea={store.guardarTarea}
            showToast={showToast}
            onGoTab={setTab}
            onIrAPago={irAPago}
            onNuevoAlumno={abrirNuevoAlumno}
            onVerAlertas={() => setAlertasOpen(true)}
          />
        )
      case 'alumnos':
        return <Alumnos data={data} onNuevoAlumno={abrirNuevoAlumno} onVerDetalle={setDetalleId} />
      case 'asistencia':
        return (
          <Asistencia
            data={data}
            esFestivo={esFestivo}
            registrarSesion={store.registrarSesion}
            eliminarSesion={store.eliminarSesion}
            showToast={showToast}
          />
        )
      case 'pagos':
        return (
          <Pagos
            data={data}
            registrarPago={store.registrarPago}
            eliminarPago={store.eliminarPago}
            showToast={showToast}
            onAbrirWhatsapp={() => setWaOpen(true)}
            preselectAlumnoId={pagosPreselect}
          />
        )
      case 'resumen':
        return <Resumen data={data} onAbrirBackup={() => setBackupOpen(true)} showToast={showToast} />
      default:
        return null
    }
  }

  return (
    <div className="app">
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

      <DetalleModal
        open={!!detalleId}
        alumnoId={detalleId}
        data={data}
        onClose={() => setDetalleId(null)}
        onEditar={abrirEditarAlumno}
      />

      <AlertasModal open={alertasOpen} alertas={alertasActuales} onClose={() => setAlertasOpen(false)} />

      <BackupModal
        open={backupOpen}
        data={data}
        onClose={() => setBackupOpen(false)}
        onRestaurar={store.restaurarBackup}
        showToast={showToast}
      />

      <WhatsappModal open={waOpen} data={data} onClose={() => setWaOpen(false)} showToast={showToast} />

      <Toast msg={msg} show={show} />
    </div>
  )
}
