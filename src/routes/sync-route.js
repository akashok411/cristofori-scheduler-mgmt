'use strict';

const router = require('express').Router();
const { ResponseEntity, } = require('../helpers/response-helper');
const syncService = require('../services/sync-service');
const messagesConst = require('../constants/messages-constants');

async function syncCustomer(req, res) {
    const responseEntity = new ResponseEntity();
    try {
        responseEntity.data = await syncService.syncCustomer(req.headers.company_id, req.body);
        if (!responseEntity.data) throw new Error(messagesConst.DATA_NOT_FOUND);
    } catch (error) {
        responseEntity.error = true;
        responseEntity.message = (error.message) ? error.message : error;
        responseEntity.code = 503;
    } finally {
        res.status(responseEntity.code).json(responseEntity);
    }
}


// Routes
router.get('/sync-customer', syncCustomer);

module.exports = router;
