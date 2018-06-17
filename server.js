const path = require('path');
const dotenv = require('dotenv').config({ path: path.resolve('./.env') });
const environment = process.env.NODE_ENV || 'localhost';
const express = require('express');

const app = express();
const db = require('./db');
const appConfig = require('./config');
const reqUtils = require('./utils/requests');
const tracing = require('./utils/tracing');
const logger = require('./utils/log').logger;
//parse JSON payloads
app.use(express.json({ limit: '2mb' }));

//allow CORS
app.use(reqUtils.middleware.cors());

//append request id for tracing
app.use(tracing(appConfig.tracingHeaderKey));

app.use(reqUtils.middleware.injectReferrer());

app.use(reqUtils.middleware.customHeaders());

const eventsRoutes = require('./controller/events');
const tagsRoutes = require('./controller/tags');
const trackingRoutes = require('./controller/tracking');
app.use(`/events`, eventsRoutes);
app.use(`/tags`, tagsRoutes);
app.use(`/tracking`,trackingRoutes);

//error handling middleware
app.use(reqUtils.middleware.defaultErrorHandler(environment));

db.sequelize.sync({
    force: true
    //alter:true
}).then(() => {
    const server = app.listen(appConfig.port, () => {
        logger.debug(`Server started on port ${appConfig.port}`);
    });
})