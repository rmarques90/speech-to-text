const mongoose = require('mongoose');

const mongoDatabase = 'speech-translate';

const startConnection = async () => {
  const mongodbURL = process.env.MONGO_DB_HOST;

  if (!mongodbURL) {
    console.error('Invalid MONGO_DB_URL');
    process.exit(1);
  }

  const mongoPort = process.env.MONGO_DB_PORT || '27017';

  await mongoose.connect(`mongodb://${mongodbURL}:${mongoPort}/${mongoDatabase}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

module.exports = {
  startConnection,
};
