module.exports = {
    apps: [
        {
            name: 'fotolar-entregas',
            script: 'server/app.js',
            interpreter: 'node',
            interpreter_args: '--experimental-vm-modules',
            env: {
                NODE_ENV: 'production',
                PORT: 3000
            },
            watch: false,
            max_memory_restart: '512M',
            error_file: './logs/err.log',
            out_file: './logs/out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss'
        }
    ]
}
