#!/usr/bin/env node

'use strict';

async function initialize() {
    try {
        const factorConfig = require('../src/configs/12-factor-config');
        const schedule = require('node-schedule');
        function getLogService(factorConfig) {
            const debug = require('debug');
            debug.enable(factorConfig.debug);

            return require('../src/services/log-service');
        };

        function monitorAndLog(server, port, factorConfig) {
            const logService = getLogService(factorConfig);
            const onError = require('./on-error');
            server.on('error', onError);

            const logStart = require('./log-start');
            logStart(port, factorConfig.nodeEnv, logService);
        }

        /* Initialize the db connection here */
        global.datasources = await require('../src/helpers/datasource-connector')()
            .catch(err => {
                const logService = getLogService(factorConfig);
                logService.getErrorLogger(err.stack);
                console.log(err);
                //  process.exit(1);
            });
        const boot = require('../src/boot');
        boot(() => {

            const app = require('../src/app');
            const port = parseInt(factorConfig.desiredPort, 10);
            const server = app.listen(port);
            console.log('[INIT] app is ready to use. It is running on port : ' + factorConfig.desiredPort);
            monitorAndLog(server, port, factorConfig);
        });

    } catch (e) {
        throw e;
    }
}

initialize();
