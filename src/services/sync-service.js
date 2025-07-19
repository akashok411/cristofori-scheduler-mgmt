'use strict';

const messagesConst = require('../constants/messages-constants');
const { scripts, } = require('../scripts/index.js');
const { executionTypes, } = require('../helpers/datasource-helper.js');
const { IDGenerator, decodeBase64Image, encodeText, sncConnection, decodeText, decodeToken, } = require('../helpers/utils');
const qs = require('qs');
const axios = require('axios').default;
const moment = require('moment');


async function syncCustomer(companyId, query) {
    try {
        
        const getCompanyInfo = await global.datasources.delivery_management_system.execute(executionTypes.postgre.singleWithReplace,
            scripts.getCompanyInfo, [companyId,]).catch(function (err) {
                throw err;
            });

        const header = getCompanyInfo[0].authMetadata.headers;
        const url = getCompanyInfo[0].authMetadata.url;
        const tokenQueryData = qs.stringify({
            username: encodeText(getCompanyInfo[0].authMetadata.requestPayload.username),
            password: encodeText(getCompanyInfo[0].authMetadata.requestPayload.password),
            grant_type: getCompanyInfo[0].authMetadata.requestPayload.grant_type
        });
        axios.defaults.baseURL = process.env.SYNC_URL;
        const getToken = await axios.post(url, tokenQueryData, { headers: header, }).catch(data => {
            throw new Error(messagesConst.INVALID_CREDS);
        });

        if (getToken.data) {
            const companyInfo = decodeToken(getToken.data.access_token);
            const requestMetadata = getCompanyInfo[0].authMetadata;
            requestMetadata.syncCustomers.headers.Authorization = `Bearer ${getToken.data.access_token}`;
            axios.defaults.headers["Authorization"] = `Bearer ${getToken.data.access_token}`;
            requestMetadata.syncCustomers.requestPayload.company_id = companyInfo ? companyInfo.company_id : '';
            requestMetadata.syncCustomers.requestPayload.timezone = process.env.PG_TZ;
            requestMetadata.syncCustomers.requestPayload.username = companyInfo ? companyInfo.username : '';
            //requestMetadata.syncCustomers.requestPayload.data.is_new = false;//false update true new cusotmers
            const updateCustoemrs = await sncConnection(requestMetadata.syncCustomers.url, requestMetadata.syncCustomers.requestPayload, { headers: requestMetadata.getCustomerOrder.headers, });
            console.log(updateCustoemrs);
            // requestMetadata.syncCustomers.requestPayload.data.is_new = true;
            // const newCusotemrs = await sncConnection(requestMetadata.syncCustomers.url, requestMetadata.syncCustomers.requestPayload, { headers: requestMetadata.getCustomerOrder.headers, });
            // console.log(newCusotemrs);
            return { data: [], message: "We’re currently syncing the customer data into SellnChill. Please check back shortly." };
        } else {
            throw new Error(messagesConst.INVALID_CREDS);
        }
    } catch (error) {
        throw error;
    }

}

module.exports =
{
    syncCustomer,
};

