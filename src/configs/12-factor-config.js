'use strict';



const factorConfig = require('12factor-config');

const factorConfigObj = factorConfig({
    allowedHeaders: {
        env: 'ALLOWED_HEADERS',
        type: 'string',
        default: '',
    },
    allowedOrigins: {
        env: 'ALLOWED_ORIGINS',
        type: 'string',
        default: '*',
    },
    appName: {
        env: 'APP_NAME',
        type: 'string',
        required: true,
        default: 'accessmgmt',
    },
    debug: {
        env: 'DEBUG',
        type: 'string',
        required: true,
        default: '',
    },
    desiredPort: {
        env: 'PORT',
        type: 'integer',
        required: true,
        default: 5956,
    },
    enableCORS: {
        env: 'ENABLE_CORS',
        type: 'boolean',
        default: true,
    },
    nodeEnv: {
        env: 'NODE_ENV',
        type: 'enum',
        values: ['development', 'production',],
        default: 'development',
    },
    api: {
        env: 'url',
        type: 'string',
        default: 'http://localhost:5956',
    },
});

module.exports = factorConfigObj;
