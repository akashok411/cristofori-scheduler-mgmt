'use strict';

const express = require('express');
const middlewareFactory = require('./middlewares');
const factorConfig = require('./configs/12-factor-config');
require('dotenv').config();
const app = express();

app.use(middlewareFactory(factorConfig));

module.exports = app;
