/* eslint-disable no-unused-vars */
const axios = require('axios');
const speech = require('@google-cloud/speech');
const fs = require('fs');

let client;

const getSpeechClient = () => {
  if (!client) {
    client = new speech.SpeechClient({ projectId: 'hotdog-project-288419', keyFilename: './google-credentials.json' });
  }
  return client;
};

const downloadAndGetAudioFile = async (urlToRequestAudioFile, filename) => {
  const file = fs.createWriteStream(`./google-speech-api/temp/${filename}.mp3`);
  try {
    const audioFileDownload = await axios({
      url: urlToRequestAudioFile,
      method: 'GET',
      responseType: 'stream',
    });

    await new Promise((resolve, reject) => {
      audioFileDownload.data.pipe(file);
      file.on('close', resolve);
      file.on('error', console.error);
    });
  } catch (e) {
    throw Error(`error downloading file -- ${e}`);
  }
};

const transcriptAudioFromUrl = async (url, languague = 'pt-BR', model = 'phone_call') => {
  if (!url) {
    throw Error('invalid URL');
  }

  const filename = Math.random().toString(36).slice(2);
  await downloadAndGetAudioFile(url, filename);

  const fileRead = fs.readFileSync(`./google-speech-api/temp/${filename}.mp3`);
  const audioBytes = fileRead.toString('base64');

  const request = {
    audio: {
      content: audioBytes,
    },
    config: {
      encoding: 'MP3',
      sampleRateHertz: 16000,
      languageCode: languague,
      model: model,
      enableAutomaticPunctuation: true
    },
  };

  const [response] = await getSpeechClient().recognize(request);
  console.log(response);
  const transcription = response.results
    .map((result) => result.alternatives[0].transcript)
    .join('\n');
  console.log(`Transcription: ${transcription}`);

  const billedTime = response.totalBilledTime.seconds;

  fs.unlinkSync(`./google-speech-api/temp/${filename}.wav`);

  return { transcription, billedTime };
};

module.exports = {
  transcriptAudioFromUrl,
};
