const schedule = require('node-schedule');

const monthlyRenewalRule = new schedule.RecurrenceRule();
monthlyRenewalRule.month = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
monthlyRenewalRule.date = 1;
monthlyRenewalRule.hour = 0;
monthlyRenewalRule.minute = 0;
monthlyRenewalRule.tz = 'America/Sao_Paulo';

const j = schedule.scheduleJob(monthlyRenewalRule, () => {
  console.log('Running monthly renewal');
});

console.log('Schedule service started!');
console.log(`next renewal job: ${j.nextInvocation()}`);
