const { default: mongoose } = require('mongoose');
const { Schema } = require('mongoose');

const User = new Schema(
  {
    relatedId: {
      type: Number,
      required: true,
      unique: true,
    },
    creditsPerMonth: {
      type: Number,
      required: true,
    },
    usedCredits: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('User', User);
