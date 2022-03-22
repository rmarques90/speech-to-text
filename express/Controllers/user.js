const { saveUser, getUserByRelatedId } = require('../../mongodb/Controllers/user');

const saveNewUser = async (user) => {
  try {
    const newUser = await saveUser(user);
    return newUser;
  } catch (e) {
    throw Error(e);
  }
};

const searchUserByRelatedId = async (relatedId) => {
  try {
    return await getUserByRelatedId(relatedId);
  } catch (e) {
    throw Error(e);
  }
};

module.exports = {
  saveNewUser, searchUserByRelatedId,
};
