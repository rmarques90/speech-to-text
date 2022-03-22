const express = require('express');
const { AUTH_SYSTEM_TOKEN, AUTH_TOKEN } = require('../../utils/constants');

const router = express.Router();

router.use(async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization === AUTH_SYSTEM_TOKEN) {
    next();
    return;
  }

  res.status(403).json({ message: 'Unauthorized' });
});

router.post('/create', async (req, res) => {
  const { body } = req;
  if (!body) {
    res.status(400).json({ message: 'invalid body' });
    return;
  }

  try {

  } catch (e) {
    console.error(`Error creating user: ${e}`);
    res.status(500).json({ message: e });
  }
});
