const express = require('express');
const { AUTH_TOKEN } = require('../../utils/constants');
const { getTranscription, userHasCredits, debitUserCredit } = require('../Controllers/transcription');

const router = express.Router();

router.use(async (req, res, next) => {
  if (!req.params.relatedId) {
    res.status(400).json({ message: 'missing relatedId queryParam' });
    return;
  }

  if (req.headers.authorization && req.headers.authorization === AUTH_TOKEN) {
    const userHasCreditsToAccess = await userHasCredits(req.params.relatedId);
    if (userHasCreditsToAccess) {
      res.status(406).json({ message: 'Unauthorized - Credits expired for this month!' });
      return;
    }
    next();
    return;
  }

  res.status(403).json({ message: 'Unauthorized' });
});

router.post('/phone-call', async (req, res) => {
  const { body } = req;
  if (!body || !body.audioUrl) {
    res.status(400).json({ message: 'invalid body' });
    return;
  }

  try {
    const transcriptionObj = await getTranscription(body.audioUrl, body.language);

    // if succedded we need to debit the credit
    const userToReturn = await debitUserCredit();

    const objToReturn = {
      transcription: transcriptionObj,
      userData: userToReturn,
    };

    res.status(200).json(objToReturn);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: e.toString() });
  }
});

module.exports = router;
