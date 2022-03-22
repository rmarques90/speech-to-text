const express = require('express');
const { AUTH_TOKEN } = require('../../utils/constants');
const { getTranscription } = require('../Controllers/transcription');

const router = express.Router();

router.use(async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization === AUTH_TOKEN) {
    next();
    return;
  }

  res.status(403).json({ message: 'Unauthorized' });
});

router.post('/phone-call', async (req, res) => {
  const { body } = req;
  if (!body) {
    res.status(400).json({ message: 'invalid body' });
    return;
  }

  try {
    const transcriptionObj = await getTranscription(body.audioUrl, body.language);

    res.status(200).json(transcriptionObj);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: e.toString() });
  }
});

module.exports = router;
