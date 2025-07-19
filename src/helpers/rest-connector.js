'use strict';
const { executionTypes, } = require('./datasource-helper.js');
const axios = require('axios');
module.exports = function () {
    function connector(serviceSettings) {
        this.type = serviceSettings.type;
        this.name = serviceSettings.name;
        this.host = serviceSettings.host;
        this.port = serviceSettings.port;
        this.address = this.host;
        console.log(this.name + ' rest service has been ready');
    };
    /**
 * 
 * @param executionType define the execution type of the query
 * @param scriptObj use to find query by db type
 * @param parameter query parameters
 * @method execute
 * @returns result of the query execution
 */
    connector.prototype.execute = async function (executionType, path, parameter, body, headersObj) {
        let result;
        if (executionType == executionTypes.rest.get) {
            result = await axios.get(this.address + path);
        } else if (executionType == executionTypes.rest.getHeader) {
            result = await axios.get(this.address + path, { headers: headersObj, });
        } else if (executionType == executionTypes.rest.post) {
            result = await axios.post(this.address + path, body, { headers: headersObj, });
        } else {
            throw new Error('ExecutionType is not suitable for this datasource');
        }
        return result;
    };
    return connector;
};
