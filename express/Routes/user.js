const express = require('express');
const { AUTH_SYSTEM_TOKEN } = require('../../utils/constants');
const { saveNewUser, searchUserByRelatedId } = require('../Controllers/user');

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
    const createdUser = await saveNewUser(body);
    res.status(200).json({ message: 'Sucessfully included', user: createdUser });
  } catch (e) {
    console.error(`Error creating user: ${e}`);
    res.status(500).json({ message: e });
  }
});

router.get('/get-by-related-id/:id', async (req, res) => {
  if (!req.params.id) {
    res.status(400).json({ message: 'no id detected' });
    return;
  }

  try {
    const user = await searchUserByRelatedId(req.params.id);
    res.status(200).json({ message: 'Sucess', user });
  } catch (e) {
    console.error(`Error searching user: ${e}`);
    res.status(500).json({ message: e });
  }
});
