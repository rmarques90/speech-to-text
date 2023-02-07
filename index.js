const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const bodyparser = require('body-parser');
const { startConnection } = require('./mongodb');
const TranscriptionRoutes = require('./express/Routes/transcription');
const { startRabbitConn } = require('./rabbitmq');
const logger = require('./Logging');

dotenv.config();

const init = async () => {
  const app = express();

  const corsWhitelist = [
    'http://example.com',
  ];

  if (process.env.CORS_WHITELIST_ADD) {
    const splittedCorsWhitelist = process.env.CORS_WHITELIST_ADD.split(',');
    splittedCorsWhitelist.forEach((c) => corsWhitelist.push(c));
  }

  const corsOptions = {
    origin(origin, callback) {
      if (corsWhitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,PUT,POST',
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  };

  if (!process.env.IGNORE_CORS) {
    app.use(cors(corsOptions));
  }
  app.use(bodyparser.json());

  // routes

  app.use('/transcript', TranscriptionRoutes);

  // initiate mongoconnection
  await startConnection();
  await startRabbitConn();

  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    logger.info(`initiated on port ${PORT}`);
  });
};

init();
