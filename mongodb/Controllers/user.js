const User = require('../Models/user');

const saveUser = async (user) => {
  let newUser = new User(user);
  newUser = await newUser.save();
  return newUser.toObject();
};

const getUserByRelatedId = async (relatedId) => User.findOne({ relatedId }).exec();

const listUsers = async (params = {}) => User.find(params).exec();

const resetAllUsersCredits = async () => User.updateMany({}, { $set: { usedCredits: 0 } }).exec();

const debitOneUserCredit = async (userRelatedId) => {
  const user = await getUserByRelatedId(userRelatedId);
  if (!user) {
    throw new Error('user not found');
  }

  user.usedCredits += 1;
  await user.save();
  return user.toObject();
};

module.exports = {
  saveUser, getUserByRelatedId, listUsers, resetAllUsersCredits, debitOneUserCredit,
};
