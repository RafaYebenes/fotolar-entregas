import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { initWhatsApp } from './services/whatsappService.js'
import entregasRouter from './routes/entregas.js'
import adminRouter from './routes/admin.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// Servir el frontend compilado (dist/)
app.use(express.static(path.join(__dirname, '..', 'dist')))

// API routes
app.use('/api/entregas', entregasRouter)
app.use('/admin', adminRouter)

// SPA fallback
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'))
})

app.listen(PORT, () => {
    console.log(`[Fotolar] Servidor escuchando en http://localhost:${PORT}`)
})

// Inicializar sesión WhatsApp al arrancar
initWhatsApp().catch(err => {
    console.error('[WA] Error al inicializar WhatsApp:', err.message)
})
