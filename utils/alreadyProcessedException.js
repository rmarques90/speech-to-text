class AlreadyProcessedException extends Error {
  constructor() {
    super();
    this.message = 'Task already processed';
  }
}

module.exports = AlreadyProcessedException;
