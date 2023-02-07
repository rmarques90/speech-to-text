const dotenv = require('dotenv');
const logger = require('./Logging');

dotenv.config();
logger.info('Starting consumer...');
require('./rabbitmq/consumer');
