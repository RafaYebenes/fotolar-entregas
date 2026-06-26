import { Router } from 'express'
import { getStatus, getQRBase64 } from '../services/whatsappService.js'
import { basicAuth } from '../middleware/basicAuth.js'

const router = Router()

router.use(basicAuth)

router.get('/whatsapp-qr', (req, res) => {
    const { estado, ultimaConexion } = getStatus()
    const qr = getQRBase64()

    if (estado === 'conectado') {
        return res.send(`<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta http-equiv="refresh" content="10"><title>WhatsApp Admin</title>
<style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f0fdf4}
.card{background:#fff;border-radius:12px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,.1);text-align:center;max-width:400px}
h2{color:#16a34a;margin:0 0 8px}p{color:#374151;margin:4px 0}</style></head>
<body><div class="card">
  <h2>✅ Sesión activa</h2>
  <p>WhatsApp Business conectado.</p>
  ${ultimaConexion ? `<p style="color:#6b7280;font-size:.85rem">Desde: ${new Date(ultimaConexion).toLocaleString('es-ES')}</p>` : ''}
  <p style="color:#9ca3af;font-size:.75rem;margin-top:16px">Esta página se recarga automáticamente cada 10 s.</p>
</div></body></html>`)
    }

    if (!qr) {
        return res.send(`<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta http-equiv="refresh" content="5"><title>WhatsApp Admin</title>
<style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#fefce8}
.card{background:#fff;border-radius:12px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,.1);text-align:center;max-width:400px}
h2{color:#854d0e;margin:0 0 8px}p{color:#374151;margin:4px 0}</style></head>
<body><div class="card">
  <h2>⏳ Iniciando WhatsApp...</h2>
  <p>Generando código QR, espera unos segundos.</p>
  <p style="color:#9ca3af;font-size:.75rem;margin-top:16px">Esta página se recarga automáticamente cada 5 s.</p>
</div></body></html>`)
    }

    res.send(`<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta http-equiv="refresh" content="30"><title>WhatsApp QR - Fotolar Admin</title>
<style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#eff6ff}
.card{background:#fff;border-radius:12px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,.1);text-align:center;max-width:400px}
h2{color:#1d4ed8;margin:0 0 8px}p{color:#374151;margin:4px 0}img{margin:16px 0;border-radius:8px}
.estado{display:inline-block;padding:4px 10px;border-radius:999px;font-size:.8rem;font-weight:600;background:#fef3c7;color:#92400e}</style></head>
<body><div class="card">
  <h2>WhatsApp Business</h2>
  <span class="estado">Estado: ${estado}</span>
  <p style="margin-top:12px">Escanea con el móvil de empresa:</p>
  <p style="color:#6b7280;font-size:.8rem">WhatsApp → ⋮ → Dispositivos vinculados → Vincular dispositivo</p>
  <img src="${qr}" alt="QR WhatsApp" width="260" height="260">
  <p style="color:#9ca3af;font-size:.75rem">El QR se refresca automáticamente cada 30 s.</p>
</div></body></html>`)
})

router.get('/whatsapp-status', (req, res) => {
    res.json(getStatus())
})

export default router
