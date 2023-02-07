const logger = require('../Logging');
const { getTranscriptionByTaskId } = require('../express/Controllers/transcription');
const NectarService = require('../utils/nectarService');
const { getRabbitMqChannel, getRabbitMqQueue, startRabbitConn } = require('./index');
const { transcriptAudioFromUrl } = require('../google-speech-api');
const TranscriptBean = require('./transcriptBean');
const { saveTranscription } = require('../mongodb/Controllers/transcriptions');
const { startConnection } = require('../mongodb');

(async () => {
  await startConnection();

  await startRabbitConn();

  const channel = getRabbitMqChannel();

  if (!channel) {
    logger.error('Error connecting on rabbitmq channel');
    process.exit(0);
  }

  const queue = getRabbitMqQueue();
  channel.prefetch(+process.env.RABBITMQ_PREFETCH || 10);

  logger.info(`Waiting for messages in  '${queue}' ...`);

  channel.consume(queue, async (msg) => {
    try {
      const {
        taskId,
        masterUserId,
      } = msg.properties.headers;

      let transcriptBean;

      logger.info(`Received message to transcript the task ${taskId} from masterUserId ${masterUserId}`);

      try {
        transcriptBean = new TranscriptBean(JSON.parse(msg.content.toString()));
      } catch (e) {
        logger.error(`[${taskId}-${masterUserId}]Error parsing msg: ${msg.content.toString()}`);

        channel.ack(msg);
        return;
      }

      // if we found in cache, lets avoid it
      const foundInCache = await getTranscriptionByTaskId(taskId, masterUserId);
      if (foundInCache) {
        channel.ack(msg);
        return;
      }

      const nectarService = new NectarService({ masterUserId });

      const { transcription, billedTime } = await transcriptAudioFromUrl(transcriptBean.audioUrl, transcriptBean.language);
      if (transcription) {
        const savedTranscription = await saveTranscription({
          transcription,
          url: transcriptBean.audioUrl,
          taskId: transcriptBean.taskId,
          masterUserId: transcriptBean.masterUserId,
          timeSeconds: billedTime,
          language: transcriptBean.language,
        });

        // now we will send it to nectar, to update the task and run the automations that are needed
      }
    } catch (e) {
      logger.error('Error consuming message...', e);
    }
    channel.ack(msg);
  });
})();
