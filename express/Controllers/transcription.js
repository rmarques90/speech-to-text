const { getAudioDurationInSeconds } = require('get-audio-duration');
const fs = require('fs');
const axios = require('axios');
const {
  findTranscriptionByTaskIdAndMasterUserId,
} = require('../../mongodb/Controllers/transcriptions');
const NectarService = require('../../utils/nectarService');
const NotAllowedException = require('../../utils/notAllowedException');
const AlreadyProcessedException = require('../../utils/alreadyProcessedException');
const TranscriptBean = require('../../rabbitmq/transcriptBean');
const { publishOnMessageQueue } = require('../../rabbitmq');
const logger = require('../../Logging');

const getTranscriptionByTaskId = async (taskId, masterUserId) => {
  const transcriptedObj = await findTranscriptionByTaskIdAndMasterUserId(taskId, masterUserId);
  if (transcriptedObj) {
    // eslint-disable-next-line no-underscore-dangle
    delete transcriptedObj._id;
    return transcriptedObj;
  }
  return null;
};

const getLengthFromAudioUrl = async (audioUrl) => {
  const filename = Math.random().toString(36).slice(2);
  const file = fs.createWriteStream(`./temp/${filename}.mp3`);
  try {
    const audioFileDownload = await axios({
      url: audioUrl,
      method: 'GET',
      responseType: 'stream',
    });

    // eslint-disable-next-line no-unused-vars
    return new Promise((resolve, reject) => {
      audioFileDownload.data.pipe(file);
      file.on('close', async () => {
        const duration = await getAudioDurationInSeconds(`./temp/${filename}.mp3`);

        fs.unlinkSync(`./temp/${filename}.mp3`);

        resolve(duration);
      });
      file.on('error', logger.error);
    });
  } catch (e) {
    throw Error(`error downloading file -- ${e}`);
  }
};

const publishTranscriptionToRabbit = async (audioUrl, taskId, masterUserId, language = 'pt-BR') => {
  const nectarService = new NectarService({ masterUserId });

  // validate if the contract has the functionality
  const hasFunctionality = await nectarService.hasTranscriptionFunctionality();
  if (!hasFunctionality) {
    throw new NotAllowedException({ message: 'The contract does not have the functionality', statusCode: 403 });
  }

  // validate if it has not been already processed
  const foundDocument = await findTranscriptionByTaskIdAndMasterUserId(taskId, masterUserId);
  if (foundDocument) {
    throw new AlreadyProcessedException('Message already processed');
  }

  // validate if the user has the balance to make this transcription
  const audioLength = await getLengthFromAudioUrl(audioUrl);
  const hasBalanceToProcess = nectarService.hasBalanceToTranscript(audioLength);
  if (!hasBalanceToProcess) {
    throw new NotAllowedException({ message: 'You do not have balance to make this action', statusCode: 403 });
  }

  // create the bean to publish
  const beanToPublish = new TranscriptBean({
    audioUrl, taskId, language, masterUserId,
  });

  publishOnMessageQueue(beanToPublish.toJsonString(), taskId, masterUserId);
};

module.exports = {
  getTranscriptionByTaskId, publishTranscriptionToRabbit,
};
