// consumer to process messages asynchronously
const amqp = require('amqplib');
const logger = require('../Logging');

let amqpConn = null;
let rabbitPubChannel = null;

/**
 * Generate RabbitMQ connection string
 * @returns {string}
 */
const getUriToConnect = () => {
  const rabbitmqUser = process.env.RABBITMQ_USER || 'guest';
  const rabbitmqPassword = process.env.RABBITMQ_PASSWORD || 'guest';
  const rabbitmqHost = process.env.RABBITMQ_HOST || 'localhost';
  const rabbitmqPort = process.env.RABBITMQ_PORT || '5672';
  const rabbitmqVHost = process.env.RABBITMQ_VHOST || 'rmarques';
  return `amqp://${rabbitmqUser}:${rabbitmqPassword}@${rabbitmqHost}:${rabbitmqPort}/${rabbitmqVHost}`;
};

const queue = process.env.RABBITMQ_QUEUE || 'speech-to-text';

/**
 * Create channel for message queue
 * @returns {NodeJS.Global.Promise<void>}
 */
const createMessageChannel = async () => {
  try {
    rabbitPubChannel = await amqpConn.createChannel();

    // setting events of error or close
    rabbitPubChannel.on('error', (err) => {
      logger.error('[AMQP] rabbitPubChannel error', err.message);
      process.exit(0);
    });
    rabbitPubChannel.on('close', () => {
      logger.info('[AMQP] rabbitPubChannel closed');
      process.exit(0);
    });

    // validating if the queue is created, if not it will be created
    rabbitPubChannel.assertQueue(queue, {
      durable: true,
    });

    logger.info('RabbitMQ connected and channel ready...');
  } catch (e) {
    logger.error('Error creating channel', e);
    process.exit(0);
  }
};

/**
 * Publish the message to Queue
 * @param {String} content - the message to publish (if its an object, must serialize first)
 * @param {Number} taskId
 * @param {Number} masterUserId
 */
const publishOnMessageQueue = (content, taskId, masterUserId) => {
  if (!content) {
    logger.debug('Message is empty or null...');
    return;
  }

  rabbitPubChannel.sendToQueue(queue, Buffer.from(content), {
    persistent: true,
    headers: {
      taskId,
      masterUserId,
    },
  });
};

/**
 * Start the connection to RabbitMQ with listeners. After it will connect on channel
 * @returns {NodeJS.Global.Promise<void>}
 */
const startRabbitConn = async () => {
  try {
    amqpConn = await amqp.connect(getUriToConnect());

    amqpConn.on('error', (err) => {
      logger.error('[AMQP] amqpConn error', err.message);
      process.exit(0);
    });
    amqpConn.on('close', () => {
      logger.info('[AMQP] amqpConn closed');
      process.exit(0);
    });

    await createMessageChannel();
  } catch (e) {
    logger.error('Error initiating connection to RabbitMQ', e);
    process.exit(0);
  }
};

const getRabbitMqChannel = () => rabbitPubChannel;

const getRabbitMqQueue = () => queue;

module.exports = {
  startRabbitConn, publishOnMessageQueue, getRabbitMqChannel, getRabbitMqQueue,
};
