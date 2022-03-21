const Transcription = require('../Models/transcriptions');

const saveTranscription = async (transcription) => {
  let newTranscription = new Transcription(transcription);
  newTranscription = await newTranscription.save();
  return newTranscription.toObject();
};

const updateTranscription = async (_id, transcription) => Transcription.updateOne({ _id, transcription });

const findTranscriptionByUrl = async (url) => Transcription.findOne({ url }).exec();

module.exports = {
  saveTranscription, findTranscriptionByUrl, updateTranscription,
};
