# fotolar-webapp 📸

**fotolar-webapp** (también conocido como *fotolar-entregas*) es una aplicación web SPA (Single Page Application) diseñada para locales físicos de fotografía (como *Fotolar Córdoba*). Permite a los clientes escanear un código QR o NFC en la tienda, acceder a la web desde su dispositivo móvil, seleccionar las fotos que desean imprimir y enviarlas de manera automatizada al WhatsApp de la empresa en archivos ZIP.

El backend gestiona una sesión de WhatsApp sin interfaz gráfica utilizando la librería **Baileys** y ofrece un panel de administración simple para vincular el dispositivo mediante código QR.

---

## 🚀 Características Principales

*   **Subida y previsualización de imágenes**: Los usuarios pueden seleccionar imágenes desde su galería, ver miniaturas, elegir el tamaño de impresión y añadir notas opcionales.
*   **Generación dinámica de ZIPs**: El servidor comprime automáticamente las imágenes seleccionadas en un archivo `.zip`.
*   **División inteligente por tamaño (Chunking)**: Si la selección supera el límite establecido (por defecto 100 MB), el servidor divide los archivos en múltiples paquetes ZIP independientes de forma automática para respetar el límite de subida de WhatsApp.
*   **Integración con WhatsApp Web**: Envío automático de los archivos ZIP a un número o grupo de WhatsApp Business configurado mediante variables de entorno.
*   **Panel de Administración**: Ruta protegida por Basic Auth (`/admin/whatsapp-qr`) para visualizar el estado de la conexión de WhatsApp y escanear el código QR de vinculación.
*   **Despliegue PM2**: Preparado para entornos de producción de forma persistente.

---

## 🛠️ Stack Tecnológico

*   **Frontend**: HTML5, Vanilla CSS, Vanilla JavaScript (componentes reactivos ligeros).
*   **Backend**: Node.js + Express.
*   **Bundler**: Vite.
*   **Servicio de WhatsApp**: `@whiskeysockets/baileys` (Multi-file auth).
*   **Otras dependencias backend**: `multer` (gestión de archivos en memoria), `archiver` (compresión zip), `qrcode` y `pino` (logs).

---

## 📁 Estructura del Proyecto

```text
fotolar/
├── .env.example                  # Plantilla de variables de entorno
├── ecosystem.config.cjs          # Configuración de despliegue para PM2
├── index.html                    # Entrada del Frontend SPA
├── package.json                  # Scripts y dependencias del proyecto
├── server/                       # Código del Servidor
│   ├── app.js                    # Inicialización de Express y servicios
│   ├── middleware/               # Middlewares (Basic Auth para admin, etc.)
│   ├── routes/                   # Endpoints de la API (/api/entregas y /admin)
│   └── services/                 # Servicios (whatsappService)
├── src/                          # Código fuente del Frontend
│   ├── components/               # Componentes SPA (UploadZone, OrderFormModal, etc.)
│   ├── main.js                   # Inicialización y enrutamiento SPA
│   ├── state.js                  # Manejo de estado reactivo global
│   ├── style.css                 # Diseño visual y estilos globales
│   └── utils/                    # Utilidades de frontend
├── uploads/                      # Directorio temporal de archivos (si aplica)
└── wa-session/                   # Credenciales guardadas de la sesión de WhatsApp
```

---

## ⚙️ Configuración (.env)

Crea un archivo `.env` en la raíz del proyecto basándote en `.env.example`:

```bash
cp .env.example .env
```

Define las siguientes variables en tu archivo `.env`:

| Variable | Descripción | Valor por Defecto |
| :--- | :--- | :--- |
| `PORT` | Puerto en el que corre la aplicación Express. | `3000` |
| `WA_SESSION_PATH` | Carpeta local donde se guardarán las credenciales de WhatsApp. | `./wa-session` |
| `WA_DESTINATION` | ID de destino de WhatsApp (número con código de país + `@s.whatsapp.net` o ID de grupo). | *Requerido* (ej. `34600000000@s.whatsapp.net`) |
| `WA_ZIP_MAX_MB` | Tamaño máximo en MB de cada archivo ZIP enviado. | `100` |
| `ADMIN_USER` | Usuario de acceso al panel de administración del QR. | `admin` |
| `ADMIN_PASS` | Contraseña de acceso al panel de administración del QR. | *Requerido cambiar* |

---

## 💻 Instalación y Desarrollo Local

### 1. Instalar dependencias

Asegúrate de estar en Node.js (se recomienda v18 o superior) y ejecuta:

```bash
npm install
```

### 2. Ejecutar en modo de desarrollo

Para el desarrollo local, necesitarás levantar tanto el servidor de desarrollo del frontend (Vite) como el backend (Express).

*   **Iniciar el servidor backend (API y WhatsApp)**:
    ```bash
    npm run server
    ```
*   **Iniciar el frontend (Vite)** en otra terminal:
    ```bash
    npm run dev
    ```
    *Esto levantará el frontend en `http://localhost:5173` y se comunicará con el backend en el puerto configurado (ej. `http://localhost:3000`).*

---

## 🚢 Despliegue en Producción

En producción, Vite compila el frontend en la carpeta `dist/`, la cual es servida de forma estática directamente por el servidor Express en el puerto configurado.

### Despliegue estándar (con npm)

1.  Compila el frontend e inicia el servidor Express:
    ```bash
    npm start
    ```

### Despliegue persistente (con PM2)

El proyecto incluye un archivo de configuración listo para PM2 (`ecosystem.config.cjs`):

1.  Asegúrate de haber instalado PM2 de forma global:
    ```bash
    npm install -g pm2
    ```
2.  Construye el frontend de producción:
    ```bash
    npm run build
    ```
3.  Arranca la aplicación con PM2:
    ```bash
    npm run pm2:start
    ```
4.  Gestión del servicio:
    *   **Ver logs en tiempo real**: `npm run pm2:logs`
    *   **Recargar el servidor**: `npm run pm2:reload`

---

## 🔑 Vinculación con WhatsApp Business

Para activar el envío de fotos a través de WhatsApp:

1.  Inicia el servidor backend en desarrollo o producción.
2.  Accede a la URL del panel de administración: `http://localhost:3000/admin/whatsapp-qr` (reemplaza `localhost:3000` con la dirección y puerto correspondientes).
3.  Introduce las credenciales de Basic Auth (`ADMIN_USER` y `ADMIN_PASS` definidas en el `.env`).
4.  Escanea el código QR que se muestra en pantalla con la aplicación de WhatsApp de tu teléfono móvil de empresa (`WhatsApp → Dispositivos vinculados → Vincular dispositivo`).
5.  Una vez vinculado, la pantalla del panel mostrará `✅ Sesión activa`. Las credenciales se persistirán en la carpeta especificada en `WA_SESSION_PATH` para evitar tener que iniciar sesión de nuevo tras reiniciar el servidor.
