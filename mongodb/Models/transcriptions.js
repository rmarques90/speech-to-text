const { default: mongoose } = require('mongoose');
const { Schema } = require('mongoose');

const Transcription = new Schema({
  url: {
    type: String,
    required: true,
    index: true,
  },
  transcription: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
    default: 'pt-BR',
  },
  timeSeconds: {
    type: Number,
  },
  userId: {
    type: mongoose.ObjectId,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Transcription', Transcription);
