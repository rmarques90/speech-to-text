const UserLog = require('../Models/userLog');

const saveUserLog = async (userLog) => {
  let userLogToSave = new UserLog(userLog);
  userLogToSave = await userLogToSave.save();
  return userLogToSave.toObject();
};

module.exports = {
  saveUserLog,
};
