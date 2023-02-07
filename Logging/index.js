const winston = require('winston');

const { format } = winston;
const WinstonGraylog2 = require('winston-graylog2');

const options = {
  name: 'Graylog',
  level: process.env.GRAYLOG_LEVEL || 'info',
  silent: false,
  handleExceptions: true,
  graylog: {
    servers: [
      {
        host: process.env.GRAYLOG_HOST || 'localhost',
        port: process.env.GRAYLOG_PORT || 12201,
      },
    ],
    facility: process.env.GRAYLOG_FACILITY || 'transcript-service',
    bufferSize: 1400,
  },
  staticMeta: {
    env: process.env.ENV || 'dev',
  },
};

const logger = winston.createLogger({
  exitOnError: false,
  format: format.simple(),
  transports: [
    new winston.transports.Console(),
    // new WinstonGraylog2(options),
  ],
});

export default logger;
