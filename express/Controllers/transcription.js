const { transcriptAudioFromUrl } = require('../../google-speech-api');
const { findTranscriptionByUrl, saveTranscription, updateTranscription } = require('../../mongodb/Controllers/transcriptions');
const { getUserByRelatedId, debitOneUserCredit } = require('../../mongodb/Controllers/user');

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

const userHasCredits = async (relatedId) => {
  const user = await getUserByRelatedId(relatedId);
  if (!user || user.usedCredits > user.creditsPerMonth) {
    return false;
  }
  return true;
};

const debitUserCredit = async (relatedId) => debitOneUserCredit(relatedId);

module.exports = {
  getTranscription, userHasCredits, debitUserCredit,
};
