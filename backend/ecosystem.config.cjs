module.exports = {
    apps: [{
        name: 'control-acceso',
        script: 'index.js',
        cwd: __dirname,
        env: {
            NODE_ENV: 'production',
            PORT: 4000
        },
        watch: false,
        max_memory_restart: '256M',
        error_file: 'logs/error.log',
        out_file: 'logs/output.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss'
    }]
};
