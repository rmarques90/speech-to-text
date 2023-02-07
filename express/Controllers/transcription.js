const { transcriptAudioFromUrl } = require('../../google-speech-api');
const {
  findTranscriptionByUrl, saveTranscription, updateTranscription, findTranscriptionByTaskIdAndMasterUserId,
} = require('../../mongodb/Controllers/transcriptions');
const NectarService = require('../../utils/nectarService');
const NotAllowedException = require('../../utils/notAllowedException');
const AlreadyProcessedException = require('../../utils/alreadyProcessedException');
const TranscriptBean = require('../../rabbitmq/transcriptBean');
const { publishOnMessageQueue } = require('../../rabbitmq');

const getTranscription = async (audioUrl, language = 'pt-BR', forceReloadFromDatabase = false) => {
  if (!audioUrl) {
    throw new Error('Audio url is invalid');
  }

  let transcriptedObj = await findTranscriptionByUrl(audioUrl);
  if (!transcriptedObj || forceReloadFromDatabase) {
    transcriptedObj = await transcriptAudioFromUrl(audioUrl, language);
    if (transcriptedObj && transcriptedObj.transcription) {
      // eslint-disable-next-line no-underscore-dangle
      if (transcriptedObj._id) {
        // eslint-disable-next-line no-underscore-dangle
        await updateTranscription(transcriptedObj._id, transcriptedObj);
      } else {
        await saveTranscription({ ...transcriptedObj, url: audioUrl });
      }
    }
  }
  // eslint-disable-next-line no-underscore-dangle
  delete transcriptedObj._id;
  // eslint-disable-next-line no-underscore-dangle
  delete transcriptedObj._v;
  return transcriptedObj;
};

const getTranscriptionByTaskId = async (taskId, masterUserId) => {
  const transcriptedObj = await findTranscriptionByTaskIdAndMasterUserId(taskId, masterUserId);
  if (transcriptedObj) {
    // eslint-disable-next-line no-underscore-dangle
    delete transcriptedObj._id;
    return transcriptedObj;
  }
  return null;
};

const publishTranscriptionToRabbit = async (audioUrl, taskId, masterUserId, language = 'pt-BR') => {
  this.nectarService = new NectarService({ masterUserId });

  const hasFunctionality = await this.nectarService.hasTranscriptionFunctionality();
  if (!hasFunctionality) {
    throw NotAllowedException({ message: 'The contract does not have the funcionality', statusCode: 403 });
  }

  const foundDocument = await findTranscriptionByTaskIdAndMasterUserId(taskId, masterUserId);
  if (foundDocument) {
    throw AlreadyProcessedException('Message already processed');
  }

  const hasBalanceToProcess

  const beanToPublish = new TranscriptBean(audioUrl, taskId, language, masterUserId);

  publishOnMessageQueue(beanToPublish.toJsonString(), taskId, masterUserId);
};

const _getLengthFromAudioUrl = (audioUrl) => {

}

module.exports = {
  getTranscription, getTranscriptionByTaskId, publishTranscriptionToRabbit,
};
