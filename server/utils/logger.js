const logger = {
    _format(level, message, meta) {
        const timestamp = new Date().toISOString();
        const metaStr = meta ? ` | ${JSON.stringify(meta)}` : '';
        return `[${timestamp}] [${level}] ${message}${metaStr}`;
    },

    info(message, meta) {
        console.log(this._format('INFO', message, meta));
    },

    warn(message, meta) {
        console.warn(this._format('WARN', message, meta));
    },

    error(message, meta) {
        console.error(this._format('ERROR', message, meta));
    },

    security(message, meta) {
        console.warn(this._format('SECURITY', message, meta));
    },

    audit(message, meta) {
        console.log(this._format('AUDIT', message, meta));
    }
};

module.exports = logger;
