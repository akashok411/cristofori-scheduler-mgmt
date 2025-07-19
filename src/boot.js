'use strict';
const schedule = require('node-schedule');
const moment = require('moment');
const { executionTypes, } = require('./helpers/datasource-helper.js');
const syncService = require('./services/sync-service');

module.exports = async (callback) => {
    async function main() {
        try {
           console.log("Sync-Date:",moment());
            syncService.syncCustomer();
        } catch (err) {
            console.log(err);
        }
    }
     // 0 0 * * * everyday
    schedule.scheduleJob('0 0 * * *', async () => {
        console.log("Function-Date:",moment());
        main();
    });

    callback();
};
