/* write summary of all the valid participants in this batch, combining useful information from workers.js and questionnaire.js */

var minTrialNumber = 1;

exports.output = [];
helpers.validParticipants().forEach(function(participant) {

   var logShortDurations = [];

   participant.trials.forEach(function(trial) {
      if (trial.number >= minTrialNumber)
         logShortDurations.push(Math.log(1 + trial.duration.short));
   });

   exports.output.push({

      /* general information about this participant */

      "id": participant.id,
      "worker_id": participant.info.worker_id,
      "assignment_id": participant.info.assignment_id,


      /* demographics */

      "gender": participant.questionnaires.demographics.gender,
      "age": helpers.getAge(participant),
      "computerUse": participant.questionnaires.demographics.computerUse,
      "wunderlistUse": participant.questionnaires.demographics.wunderlistUse,

      /* apparatus */

      "OS": participant.info.apparatus.os,
      "browser": participant.info.apparatus.browser,

      /* condition */

      "defaults": participant.condition.oppositeDefaults ? "opposite" : "",
      "partition": participant.condition.partition ? "partition1" : "partition0",
      "interface": participant.condition.interface,
      "interfaceType": participant.condition.interface > 0 ? "customizationMode" : "control",

      /* key information about their trials */

      "numTimeouts": helpers.getNumTimeouts(participant),
      "numErrors": totalNumTrials - helpers.getNumSuccesses(participant),
      "averageLogShortDuration": (Math.exp(Math.average(logShortDurations)) - 1).toFixed(1),
      // my own classification of problematic participants, to see the impact of the num of errors and duration
      "problems": problems[participant.id] == 2 ? "MAJOR" : problems[participant.id] == 1 ? "minor" : "",

      /* durations */

      // time it took participants to complete all steps of the tutorial
      "tutorialDuration": helpers.getTutorialDuration(participant).toFixed(1),
      // time it took participants to complete all the trials of the experiment
      "trialsDuration": helpers.getTrialsDuration(participant).toFixed(0),
      // time it took participants to reach the final page, in minutes
      "totalDuration": helpers.getTotalDuration(participant).toFixed(0),

      /* feedback */

      "bugFeedback": helpers.formatStringForCSV(participant.questionnaires.bugFeedback),
      "interfaceFeedback": helpers.formatStringForCSV(participant.questionnaires.preference.feedback),
      "generalFeedback": helpers.formatStringForCSV(participant.questionnaires.additionalFeedback),

      // base rate + bonus for that participant, if any
      "payment": helpers.getPayment(participant)
   })

});


helpers.sortByConditionThenParticipant(exports.output)


function getAverageValueForValidParticipants(getter, average) {
   return average(helpers.validParticipants().map(function(participant) {
      return getter(participant);
   }))
}

function printFormattedMeanDurations(getter) {
   return helpers.formatMinuteSeconds(getAverageValueForValidParticipants(getter, Math.average)) + ' [' + helpers.formatMinuteSeconds(getAverageValueForValidParticipants(getter, Math.geometricMean)) + ']';
}

function getHourlyRate(participant) {
   return helpers.getPayment(participant) / helpers.getTotalDuration(participant) * 60;
}

function printFormattedMeanPayments(getter) {
   return getAverageValueForValidParticipants(getter, Math.average).toFixed(2) + ' [' + getAverageValueForValidParticipants(getter, Math.geometricMean).toFixed(2) + ']';
}


// print some summary statistics to the console
console.log("Average [geom] tutorial duration (mm.ss):", printFormattedMeanDurations(helpers.getTutorialDuration));
console.log("Average [geom] trials duration (mm.ss):", printFormattedMeanDurations(helpers.getTrialsDuration));
console.log("Average [geom] total duration (mm.ss):", printFormattedMeanDurations(helpers.getTotalDuration));
console.log("Average [geom] payment ($):", printFormattedMeanPayments(helpers.getPayment));
console.log("Average [geom] hourly rate ($/hr):", printFormattedMeanPayments(getHourlyRate));
console.log();
