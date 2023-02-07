const Transcription = require('../Models/transcriptions');

const saveTranscription = async (transcription) => {
  let newTranscription = new Transcription(transcription);
  newTranscription = await newTranscription.save();
  return newTranscription.toObject();
};

const updateTranscription = async (_id, transcription) => Transcription.updateOne({ _id, transcription });

const findTranscriptionByUrl = async (url) => Transcription.findOne({ url }).exec();

const listTranscriptionsByMasterUserId = async (masterUserId) => Transcription.find({ masterUserId }).exec();

const findTranscriptionByTaskIdAndMasterUserId = async (taskId, masterUserId) => Transcription.findOne({ taskId, masterUserId }).exec();

module.exports = {
  saveTranscription, findTranscriptionByUrl, updateTranscription, listTranscriptionsByMasterUserId, findTranscriptionByTaskIdAndMasterUserId,
};
