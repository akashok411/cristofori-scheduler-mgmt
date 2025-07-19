'use strict';
const { datasourceTypes , } = require('./datasource-helper.js');
const PostgreConnector = require('./postgres-connector')();
const ServiceConnector = require('./rest-connector')();
const createDatasources = async ()=>{
    const datasources = {};
    const definition = require('../configs/datasources.js').definition; 
    for (const setting of definition) {
        let connector;
        if (setting.type == datasourceTypes.postgre) {
            connector = new PostgreConnector(setting);
            await connector.letsPool();
        } else if (setting.type == datasourceTypes.rest) {
            connector = new ServiceConnector(setting);
        }
        if (connector)
            datasources[setting.name] = connector;
    } 
   
    return datasources;
};
module.exports = createDatasources;

