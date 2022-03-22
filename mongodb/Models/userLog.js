const { default: mongoose } = require('mongoose');
const { Schema } = require('mongoose');

const UserLog = new Schema({
  userId: {
    type: mongoose.ObjectId,
    required: true,
  },
  usedCredits: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('UserLog', UserLog);
