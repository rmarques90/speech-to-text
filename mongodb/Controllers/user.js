const User = require('../Models/user');

const saveUser = async (user) => {
  let newUser = new User(user);
  newUser = await newUser.save();
  return newUser.toObject();
};

module.exports = {
  saveUser,
};
