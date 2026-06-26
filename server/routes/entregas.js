import { Router } from 'express'
import multer from 'multer'
import archiver from 'archiver'
import { sendZip, getStatus } from '../services/whatsappService.js'

const router = Router()
const upload = multer({ storage: multer.memoryStorage() })

const MAX_BYTES = () => parseInt(process.env.WA_ZIP_MAX_MB || '100', 10) * 1024 * 1024

router.post('/whatsapp', upload.array('files'), async (req, res) => {
    const files = req.files
    if (!files || files.length === 0) {
        return res.status(400).json({ ok: false, error: 'NO_FILES', mensaje: 'No se han enviado archivos.' })
    }

    const { estado } = getStatus()
    if (estado !== 'conectado') {
        return res.status(503).json({
            ok: false,
            error: 'WA_SESSION_UNAVAILABLE',
            mensaje: 'La sesión de WhatsApp no está activa. Contacta con el administrador.'
        })
    }

    const nota = req.body?.nota || null
    const orderCode = req.body?.orderCode || 'FL-0000'
    const now = new Date()
    const ts = now.toISOString().replace(/[-:T]/g, '').slice(0, 15)

    // Dividir archivos en partes de máx. MAX_BYTES cada una
    const parts = splitFilesIntoParts(files, MAX_BYTES())

    // Enviar cada parte
    try {
        for (let i = 0; i < parts.length; i++) {
            const partLabel = parts.length > 1 ? `_parte${i + 1}de${parts.length}` : ''
            const filename = `fotolar_${ts}${partLabel}.zip`
            const zipBuffer = await buildZip(parts[i])
            const zipMB = (zipBuffer.length / 1024 / 1024).toFixed(1)

            console.log(`[WA] Enviando ${filename} (${zipMB} MB)...`)

            // En la primera parte incluir la nota, el resto solo el archivo
            const partNota = i === 0 && nota ? nota : null
            await sendZip(zipBuffer, filename, partNota)

            console.log(`[WA] ${filename} enviado.`)
        }
    } catch (err) {
        console.error('[WA] Error al enviar ZIP:', err)
        return res.status(500).json({ ok: false, error: 'SEND_FAILED', mensaje: 'Error al enviar el archivo. Inténtalo de nuevo.' })
    }

    const totalMB = (files.reduce((acc, f) => acc + f.size, 0) / 1024 / 1024).toFixed(1)
    res.json({
        ok: true,
        mensaje: `${parts.length > 1 ? `${parts.length} ZIPs enviados` : 'ZIP enviado'} correctamente al WhatsApp de empresa`,
        partes: parts.length,
        tamañoTotal: `${totalMB} MB`,
        timestamp: now.toISOString()
    })
})

// Agrupa archivos en partes sin superar maxBytes por parte
function splitFilesIntoParts(files, maxBytes) {
    const parts = []
    let currentPart = []
    let currentSize = 0

    for (const file of files) {
        // Si un solo archivo supera el límite, va solo en su propia parte
        if (file.size > maxBytes) {
            if (currentPart.length > 0) {
                parts.push(currentPart)
                currentPart = []
                currentSize = 0
            }
            parts.push([file])
            continue
        }

        if (currentSize + file.size > maxBytes && currentPart.length > 0) {
            parts.push(currentPart)
            currentPart = [file]
            currentSize = file.size
        } else {
            currentPart.push(file)
            currentSize += file.size
        }
    }

    if (currentPart.length > 0) parts.push(currentPart)
    return parts
}

function buildZip(files) {
    return new Promise((resolve, reject) => {
        const archive = archiver('zip', { zlib: { level: 6 } })
        const chunks = []

        archive.on('data', chunk => chunks.push(chunk))
        archive.on('end', () => resolve(Buffer.concat(chunks)))
        archive.on('error', reject)

        for (const file of files) {
            archive.append(file.buffer, { name: file.originalname })
        }

        archive.finalize()
    })
}

export default router
