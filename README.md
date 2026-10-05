# AvrentoHub (React + Vite)

App de gestión para academias (alumnos, calendario, asistencia, pagos, resumen, WhatsApp,
backup/restauración y exportación a Excel), con diseño premium y PWA instalable.

## Desarrollo local

```bash
npm install
npm run dev
```

## Desplegar en GitHub + Vercel

### 1. Sube el proyecto a GitHub

```bash
git init
git add .
git commit -m "AvrentoHub"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/avrentohub.git
git push -u origin main
```

(Sustituye la URL por la de tu propio repositorio, creado vacío en GitHub primero.)

### 2. Importa el repo en Vercel

1. Entra en [vercel.com](https://vercel.com) e inicia sesión con tu cuenta de GitHub.
2. "Add New..." → "Project" → selecciona el repositorio `avrentohub`.
3. Vercel detecta automáticamente que es un proyecto **Vite**:
   - Build Command: `vite build` (o `npm run build`)
   - Output Directory: `dist`
   - No hace falta tocar nada más.
4. "Deploy". En ~1 minuto tendrás una URL pública tipo `https://avrentohub.vercel.app`.

### 3. Probarla en el móvil

Abre esa URL en el navegador del móvil. Como es una PWA:
- En Android (Chrome): menú → "Instalar aplicación" / "Añadir a pantalla de inicio".
- En iOS (Safari): botón compartir → "Añadir a pantalla de inicio".

Una vez instalada, se abre a pantalla completa como una app nativa, con el icono de AvrentoHub.

### Actualizaciones posteriores

Cada `git push` a `main` genera automáticamente un nuevo despliegue en Vercel — no hace falta
volver a importar el proyecto ni configurar nada.

## Notas técnicas

- El proyecto está configurado para servirse desde la **raíz** del dominio (`base: '/'` en
  `vite.config.js`, y `manifest.json`/`sw.js` con rutas absolutas `/...`). Esto es lo que espera
  Vercel (a diferencia de GitHub Pages, donde el proyecto vivía bajo `/avrentohub/`).
- `vercel.json` fija las cabeceras correctas para `manifest.json` y `sw.js`.
- Los datos de la app se guardan en `localStorage` del propio dispositivo (no en un servidor);
  usa el botón **Backup** en la pestaña Resumen para exportar/restaurar un `.json` de seguridad
  (incluye festivos y plantillas de WhatsApp).
- Cada pago cobrado guarda qué cubre (`cubre`: `mes`, `pack`, `sesion` o `extra`, y `unidades`),
  calculado con el precio vigente al cobrarlo. Así, cambiar la tarifa o la modalidad de un alumno
  no altera lo que ya estaba pagado. Los pagos antiguos se convierten solos al abrir la app.
- Clases puntuales (`data.puntuales`): cambios que solo afectan a una fecha, encima del horario fijo
  (añadir, mover o cancelar una clase). Una clase movida cuenta como recuperación y no genera clase
  extra. Cada turno tiene 4 plazas (`PLAZAS_POR_TURNO` en `constants.js`).
- Las fuentes (Work Sans, Bebas Neue, JetBrains Mono) van incluidas vía `@fontsource`: no
  dependen de Google Fonts y funcionan sin conexión.
- La librería de Excel (`xlsx`) se descarga solo al pulsar "Exportar Excel", para que la app
  arranque más rápido.
- Los estilos están en `src/styles.css`; en los componentes solo quedan inline los colores que
  dependen de datos (color de cada alumno, tipo de festivo) y las posiciones de la barra inferior.

## Estructura

```
src/
  utils/         constantes, helpers y lógica de negocio (alertas, pendientes)
  hooks/         useAppData (estado + persistencia), useToast
  components/    TabBar, Toast, ScreenHeader, Modal genérico y modales en components/modals/
  views/         Inicio, Alumnos, Calendario, Asistencia, Pagos, Resumen
  App.jsx        orquesta pestañas, modales y estado global
public/          manifest.json, sw.js, iconos (assets estáticos que Vite copia tal cual)
```
