import makeWASocket, { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import qrcode from 'qrcode'
import path from 'path'
import pino from 'pino'

let sock = null
let connectionState = 'desconectado'
let lastConnected = null
let currentQRBase64 = null

export async function initWhatsApp() {
    const sessionPath = process.env.WA_SESSION_PATH || './wa-session'
    const { state, saveCreds } = await useMultiFileAuthState(path.resolve(sessionPath))
    const { version } = await fetchLatestBaileysVersion()
    console.log('[WA] Versión WA Web:', version.join('.'))

    sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        browser: ['Fotolar', 'Chrome', '120.0.0'],
        logger: pino({ level: 'silent' })
    })

    sock.ev.on('connection.update', async ({ qr, connection, lastDisconnect }) => {
        if (qr) {
            currentQRBase64 = await qrcode.toDataURL(qr)
            connectionState = 'desconectado'
            console.log('[WA] Nuevo QR generado. Escanea en /admin/whatsapp-qr')
        }

        if (connection === 'open') {
            connectionState = 'conectado'
            lastConnected = new Date().toISOString()
            currentQRBase64 = null
            console.log('[WA] Sesión conectada:', lastConnected)
        }

        if (connection === 'close') {
            const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut
            console.log('[WA] Conexión cerrada. Código:', statusCode, '| Reconectar:', shouldReconnect)
            connectionState = shouldReconnect ? 'reconectando' : 'desconectado'
            if (shouldReconnect) {
                setTimeout(() => initWhatsApp(), 3000)
            }
        }
    })

    sock.ev.on('creds.update', saveCreds)
}

export function getStatus() {
    return {
        estado: connectionState,
        ultimaConexion: lastConnected,
        qrDisponible: !!currentQRBase64
    }
}

export function getQRBase64() {
    return currentQRBase64
}

export async function sendZip(zipBuffer, filename, nota) {
    if (connectionState !== 'conectado') {
        throw new Error('WA_SESSION_UNAVAILABLE')
    }
    const destination = process.env.WA_DESTINATION
    if (!destination) throw new Error('WA_DESTINATION no configurado')

    if (nota) {
        await sock.sendMessage(destination, { text: nota })
    }
    await sock.sendMessage(destination, {
        document: zipBuffer,
        mimetype: 'application/zip',
        fileName: filename
    })
}
