import { Router } from 'express'
import { getStatus, getQRBase64 } from '../services/whatsappService.js'
import { basicAuth } from '../middleware/basicAuth.js'

const router = Router()

router.use(basicAuth)

router.get('/whatsapp-qr', (req, res) => {
    const { estado, ultimaConexion } = getStatus()
    const qr = getQRBase64()

    const baseStyle = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap');
        :root{
            --primary:#d32f2f;--primary-hover:#b71c1c;--primary-light:#ffebee;
            --secondary:#0f172a;--success:#25d366;--success-hover:#128c7e;
            --background:#f8fafc;--surface:#ffffff;--border:#e2e8f0;
            --text-main:#0f172a;--text-muted:#64748b;
        }
        *{box-sizing:border-box}
        body{font-family:'Inter',-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:var(--secondary);color:var(--text-main)}
        .card{background:var(--surface);border-radius:20px;padding:36px 32px;box-shadow:0 20px 40px rgba(15,23,42,.35);text-align:center;max-width:400px;border-top:4px solid var(--primary)}
        h2{font-family:'Playfair Display',Georgia,serif;color:var(--secondary);margin:0 0 8px;font-size:1.4rem}
        p{color:var(--text-muted);margin:4px 0}
    `

    if (estado === 'conectado') {
        return res.send(`<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta http-equiv="refresh" content="10"><title>WhatsApp Admin</title>
<style>${baseStyle}
.card{border-top-color:var(--success)}
h2{color:var(--success-hover)}</style></head>
<body><div class="card">
  <h2>✅ Sesión activa</h2>
  <p>WhatsApp Business conectado.</p>
  ${ultimaConexion ? `<p style="color:#9ca3af;font-size:.85rem">Desde: ${new Date(ultimaConexion).toLocaleString('es-ES')}</p>` : ''}
  <p style="color:#9ca3af;font-size:.75rem;margin-top:16px">Esta página se recarga automáticamente cada 10 s.</p>
</div></body></html>`)
    }

    if (!qr) {
        return res.send(`<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta http-equiv="refresh" content="5"><title>WhatsApp Admin</title>
<style>${baseStyle}</style></head>
<body><div class="card">
  <h2>⏳ Iniciando WhatsApp...</h2>
  <p>Generando código QR, espera unos segundos.</p>
  <p style="color:#9ca3af;font-size:.75rem;margin-top:16px">Esta página se recarga automáticamente cada 5 s.</p>
</div></body></html>`)
    }

    res.send(`<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta http-equiv="refresh" content="30"><title>WhatsApp QR - Fotolar Admin</title>
<style>${baseStyle}
img{margin:16px 0;border-radius:12px;border:1px solid var(--border);padding:8px;background:#fff}
.estado{display:inline-block;padding:4px 14px;border-radius:999px;font-size:.8rem;font-weight:600;background:var(--primary-light);color:var(--primary-hover)}</style></head>
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
