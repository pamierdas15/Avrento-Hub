import { useState, useEffect, useCallback } from 'react'
import TabBar from './components/TabBar.jsx'
import Toast from './components/Toast.jsx'
import Inicio from './views/Inicio.jsx'
import Alumnos from './views/Alumnos.jsx'
import Calendario from './views/Calendario.jsx'
import Asistencia from './views/Asistencia.jsx'
import Pagos from './views/Pagos.jsx'
import Resumen from './views/Resumen.jsx'
import AlumnoModal from './components/modals/AlumnoModal.jsx'
import DetalleModal from './components/modals/DetalleModal.jsx'
import EventoModal from './components/modals/EventoModal.jsx'
import VerFestivoModal from './components/modals/VerFestivoModal.jsx'
import FestivoModal from './components/modals/FestivoModal.jsx'
import AlertasModal from './components/modals/AlertasModal.jsx'
import BackupModal from './components/modals/BackupModal.jsx'
import WhatsappModal from './components/modals/WhatsappModal.jsx'
import { useAppData } from './hooks/useAppData.js'
import { useToast } from './hooks/useToast.js'
import { getAlertas } from './utils/business.js'
import { BACKUP_SK } from './utils/constants.js'

export default function App() {
  const store = useAppData()
  const { data, festivos, esFestivo } = store
  const { msg, show, showToast } = useToast()

  const [tab, setTab] = useState('inicio')

  // Modal: alumno (crear/editar)
  const [alumnoModalOpen, setAlumnoModalOpen] = useState(false)
  const [editingAlumno, setEditingAlumno] = useState(null)

  // Modal: detalle
  const [detalleId, setDetalleId] = useState(null)

  // Modal: evento calendario
  const [evento, setEvento] = useState(null) // {alumnoId, fecha}

  // Modal: ver festivo
  const [verFestivoFecha, setVerFestivoFecha] = useState(null)

  // Modal: crear festivo
  const [festivoModalOpen, setFestivoModalOpen] = useState(false)

  // Modal: alertas
  const [alertasOpen, setAlertasOpen] = useState(false)

  // Modal: backup
  const [backupOpen, setBackupOpen] = useState(false)

  // Modal: whatsapp
  const [waOpen, setWaOpen] = useState(false)

  useEffect(() => {
    // Alerta automática al entrar (equivalente a checkAlertas() original)
    const alertas = getAlertas(data)
    if (alertas.length) setAlertasOpen(true)
    // Aviso de backup semanal
    const u = localStorage.getItem(BACKUP_SK)
    if (u) {
      const dias = Math.floor((new Date() - new Date(u)) / (1000 * 60 * 60 * 24))
      if (dias >= 7) showToast('⚠ Hace ' + dias + ' días del último backup')
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

  function registrarSesionYAvisar(alumnoId, fecha, estado) {
    const ok = store.registrarSesion(alumnoId, fecha, estado)
    if (ok) { setEvento(null); showToast('Asistencia registrada') }
    return ok
  }

  function guardarFestivo(festivo) {
    store.guardarFestivo(festivo)
    setFestivoModalOpen(false)
    showToast('Día bloqueado')
  }

  function eliminarFestivo(fecha) {
    store.eliminarFestivo(fecha)
    setVerFestivoFecha(null)
    showToast('Día desbloqueado')
  }

  const alertasActuales = getAlertas(data)

  function renderView() {
    switch (tab) {
      case 'inicio':
        return (
          <Inicio
            data={data}
            esFestivo={esFestivo}
            registrarSesion={store.registrarSesion}
            showToast={showToast}
            onGoTab={setTab}
            onNuevoAlumno={abrirNuevoAlumno}
            onVerAlertas={() => setAlertasOpen(true)}
          />
        )
      case 'alumnos':
        return <Alumnos data={data} onNuevoAlumno={abrirNuevoAlumno} onVerDetalle={setDetalleId} />
      case 'calendario':
        return (
          <Calendario
            data={data}
            esFestivo={esFestivo}
            onVerEvento={(alumnoId, fecha) => setEvento({ alumnoId, fecha })}
            onVerFestivo={setVerFestivoFecha}
            onAbrirFestivo={() => setFestivoModalOpen(true)}
          />
        )
      case 'asistencia':
        return <Asistencia data={data} registrarSesion={store.registrarSesion} eliminarSesion={store.eliminarSesion} showToast={showToast} />
      case 'pagos':
        return <Pagos data={data} registrarPago={store.registrarPago} eliminarPago={store.eliminarPago} showToast={showToast} onAbrirWhatsapp={() => setWaOpen(true)} />
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

      <EventoModal
        open={!!evento}
        alumnoId={evento?.alumnoId}
        fecha={evento?.fecha}
        data={data}
        onClose={() => setEvento(null)}
        onRegistrar={registrarSesionYAvisar}
      />

      <VerFestivoModal
        open={!!verFestivoFecha}
        fecha={verFestivoFecha}
        festivo={verFestivoFecha ? esFestivo(verFestivoFecha) : null}
        data={data}
        onClose={() => setVerFestivoFecha(null)}
        onEliminar={eliminarFestivo}
      />

      <FestivoModal
        open={festivoModalOpen}
        data={data}
        onClose={() => setFestivoModalOpen(false)}
        onGuardar={guardarFestivo}
        showToast={showToast}
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
