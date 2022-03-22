const UserLog = require('../Models/userLog');

const saveUserLog = async (userLog) => {
  let userLogToSave = new UserLog(userLog);
  userLogToSave = await userLogToSave.save();
  return userLogToSave.toObject();
};

const convertActualUserDocToLog = (userDoc) => {
  const userLog = new UserLog();
  // eslint-disable-next-line no-underscore-dangle
  userLog.userId = userDoc._id;
  userLog.usedCredits = userDoc.usedCredits;
  return userLog;
};

module.exports = {
  saveUserLog, convertActualUserDocToLog,
};
