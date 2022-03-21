const { transcriptAudioFromUrl } = require('../../google-speech-api');
const { findTranscriptionByUrl, saveTranscription, updateTranscription } = require('../../mongodb/Controllers/transcriptions');

const getTranscription = async (audioUrl, language = 'pt-BR', forceReloadFromDatabase = false) => {
  if (!audioUrl) {
    throw new Error('Audio url is invalid');
  }

  let transcriptedObj = await findTranscriptionByUrl(audioUrl);
  if (!transcriptedObj || forceReloadFromDatabase) {
    transcriptedObj = await transcriptAudioFromUrl(audioUrl, language);
    if (transcriptedObj && transcriptedObj.transcription) {
      if (transcriptedObj._id) {
          await updateTranscription(transcriptedObj._id, transcriptedObj);
      } else {
          await saveTranscription({...transcriptedObj, url: audioUrl});
      }
    }
  }

  delete transcriptedObj._id;
  delete transcriptedObj._v;
  return transcriptedObj;
};

module.exports = {
  getTranscription,
};
