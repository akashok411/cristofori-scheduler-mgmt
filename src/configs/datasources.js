'use strict';

const { datasourceTypes, } = require('../helpers/datasource-helper.js');
module.exports.definition = [
    {
        type: datasourceTypes.postgre,
        database: 'service_dlv_mgmt',
        user: 'postgres',
        name: 'delivery_management_system',
        url: 'localhost',
        port: 5432,
        password: 'master@22',
    },
];


// module.exports.definition = [
//     {
//         type: datasourceTypes.postgre,
//         database: 'delivery_system',
//         user: "devuser1",
//         name: 'delivery_management_system',
//         url: 'localhost',
//         port: 5432,
//         password: "India@007",
//     },
//     {
//         type: datasourceTypes.rest,
//         name: 'lazada_orders',
//         host: 'http://158.140.133.81/MPNext'
//     }
// ];
