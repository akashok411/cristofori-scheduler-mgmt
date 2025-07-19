'use strict';

const Pool = require('pg-pool');
const scripts = require('../scripts/postgre-scripts.js');
const { executionTypes, } = require('./datasource-helper.js');
module.exports = function () {
    function connector(dbSettings) {
        this.type = dbSettings.type;
        this.name = dbSettings.name;
        this.pool = new Pool(dbSettings);
        this.pool.on('error', (err, client) => {
            console.log(`Error on Postgre Pool`);
            console.log('error ', err);
        });
    };
    connector.prototype.letsPool = async function () {
        const client = await this.pool.connect().catch(err => console.error(err.message, err.stack));
        console.log('Connected to POSTGRE');
        if (client)
            client.release();
    };
    /**
* 
  @param executionType define the execution type of the query
  * @param scriptObj use to find query by db type
  * @param parameter query parameters
  * @method execute
  * @returns result of the query execution
  */
    connector.prototype.execute = async function (executionType, scriptObj, parameter) {
        let script;
        if (executionType == executionTypes.postgre.singleWithReplace) {
            let index = 1;
            script = scripts[scriptObj];
            parameter.forEach(element => {
                const toChange = `@param` + index;
                script = script.toString().replace(toChange, element);
                index += 1;
            });
        } else if (executionType === executionTypes.postgre.bulk) {
            const baseScript = scripts[scriptObj];
            script = [];
            parameter.forEach(row => {
                let index = 1;
                let tempScript = baseScript;
                row.forEach(value => {
                    const toChange = `@param` + index;
                    tempScript = tempScript.toString().replace(toChange, value);
                    index += 1;
                });
                script.push(tempScript);
            });
            script = script.join(`;`);
        } else if (executionType === executionTypes.postgre.customQuery) {
            script = scriptObj;
        } else {
            throw new Error('ExecutionType is not suitable for this datasource');
        }
        const client = await this.pool.connect();
        let result;
        try {
            result = await client.query(script);
        } finally {
            if (client)
                client.release();
        }
        return result.rows;
    };

    return connector;
};
