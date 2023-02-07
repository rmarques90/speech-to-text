export default class TranscriptBean {
  constructor({
    audioUrl, taskId, language, masterUserId,
  }) {
    this.audioUrl = audioUrl;
    this.taskId = taskId;
    this.language = language;
    this.masterUserId = masterUserId;
  }

  toJsonString() {
    return JSON.stringify({
      audioUrl: this.audioUrl,
      taskId: this.taskId,
      language: this.language,
      masterUserId: this.masterUserId,
    });
  }
}
