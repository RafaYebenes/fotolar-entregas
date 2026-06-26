export function basicAuth(req, res, next) {
    const authHeader = req.headers['authorization'] || ''
    const base64 = authHeader.startsWith('Basic ') ? authHeader.slice(6) : ''
    const [user, pass] = Buffer.from(base64, 'base64').toString().split(':')

    const validUser = process.env.ADMIN_USER || 'admin'
    const validPass = process.env.ADMIN_PASS || 'cambiar_en_produccion'

    if (user === validUser && pass === validPass) {
        return next()
    }

    res.set('WWW-Authenticate', 'Basic realm="Fotolar Admin"')
    res.status(401).json({ error: 'No autorizado' })
}
