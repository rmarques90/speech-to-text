const express = require('express');
const { AUTH_TOKEN } = require('../../utils/constants');
const { getTranscriptionByTaskId, publishTranscriptionToRabbit } = require('../Controllers/transcription');

const router = express.Router();

router.use(async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization === AUTH_TOKEN) {
    next();
    return;
  }

  res.status(403).json({ message: 'Unauthorized' });
});

router.get('/get-by-task/:taskId', async (req, res) => {
  const { taskId } = req.params;
  const { masterUserId } = req.query;
  if (!taskId || !masterUserId) {
    res.status(400).json({ message: 'invalid task id or master user id' });
    return;
  }

  try {
    const transcriptionObj = await getTranscriptionByTaskId(taskId, masterUserId);
    if (transcriptionObj) {
      res.status(200).json(transcriptionObj);
    } else {
      res.status(404).json({ message: 'transcription not found for task' });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: e.toString() });
  }
});

router.post('/generate', async (req, res) => {
  const { body } = req;
  if (!body) {
    res.status(400).json({ message: 'invalid body' });
    return;
  }

  try {
    const {
      audioUrl, language, taskId, masterUserId,
    } = body;

    await publishTranscriptionToRabbit(audioUrl, taskId, masterUserId, language);

    res.status(200).json({ message: 'Message published to RabbitMQ' });
  } catch (e) {
    console.error(e);
    let status = 500;
    let message = '';
    if (e.statusCode) {
      status = e.statusCode;
    }
    if (e.message) {
      message = e.message;
    }
    res.status(status).json({ message });
  }
});

module.exports = router;
