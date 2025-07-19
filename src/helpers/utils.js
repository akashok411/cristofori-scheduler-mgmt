'use strict';
const GlobalService = require('./job-polling');
const CryptoJS = require("crypto-js");
const fernet = require('fernet');
const axios = require('axios').default;
const jwt = require('jsonwebtoken');
/**
* @name Utils
* @return {undefined}
*/
function IDGenerator() {
    const length = 8;
    const timestamp = +new Date;

    const _getRandomInt = function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    const generate = function () {
        const ts = timestamp.toString();
        const parts = ts.split('').reverse();
        let id = '';

        for (let i = 0; i < length; ++i) {
            const index = _getRandomInt(0, parts.length - 1);
            id += parts[index];
        }

        return id;
    };

    return generate();
}

function decodeBase64Image(dataString) {
    const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    const response = {};

    if (matches.length !== 3) {
        return new Error('Invalid input string');
    }

    response.type = matches[1];
    response.data = new Buffer(matches[2], 'base64');

    return response;
}

function encodeText(text) {
    const secret = new fernet.Secret(process.env.SECRET_KEY);

    const token = new fernet.Token({
        secret: secret
    })
    return token.encode(CryptoJS.enc.Utf8.parse(text)) 
};
function decodeToken(token) {/* 
    const jwtPayload = token.split('.')[1];
    const tkn = (base64.decode(jwtPayload)).replace(/\u0000/gi, ''); */
    return jwt.decode(token);
}
function decodeText(text) {
    const secret = new fernet.Secret(process.env.SECRET_KEY);
    const token = new fernet.Token({
        secret: secret,
        token: text,
        ttl: 0,
    });
    token.decode();
    return token; 
};
async function sncConnection(url, req, headers) {
    try {
        const resp = await axios.post(url, req, headers);
        const res = resp.data;
      //  console.log("intitial",resp);
        if (res?.status?.code !== 200 || !res?.status?.success || !res?.job_id) {
            return { error: true, message: res?.status?.msg || "API call failed", data: {}, status: 'error' };
        }
        const pollingResult = await new Promise((resolve, reject) => {
            const subscription = GlobalService
                .startPoll(
                    "Get",
                    GlobalService.randomGenerator(),
                    () => GlobalService.getJobStatus(res?.job_id),
                    response => response,
                    GlobalService.POLLING_MESSAGES.GET_DATA
                )
                .subscribe(
                    result => {
                        const data = result?.data || {};
                        //console.log("inside",(result));
                        if (data.process_status === "processed") {
                            subscription.unsubscribe(); // Stop polling when processed.
                            if (data && data?.status?.code === 200) {
                                resolve(data.result);
                            } else {
                                reject(data);
                            }
                        }
                    },
                    err => {
                        //console.log("inside-error");
                        subscription.unsubscribe(); // Stop polling on error.
                        reject(err);
                    }
                );
        });

        return { error: false, message: "Successfully fetched data", data: pollingResult, status: 'success' };

    } catch (error) {
        const jobResult = error?.result?.metadata || {};
        const errorMsg = error?.status?.message || error?.message || "An unexpected error occurred.";
        const timeOutErr = error === "TIME_OUT" ? "The request timed out while processing your job. The operation is still pending. Please try again/refresh later to check the status." : errorMsg;

        return {
            error: true,
            message: timeOutErr,
            is_time_out: error === "TIME_OUT",
            data: jobResult,
            status: error === "TIME_OUT" ? 'Time Out' : 'error'
        };
    }
}
module.exports = { IDGenerator, decodeBase64Image, sncConnection, encodeText, decodeText, decodeToken };
