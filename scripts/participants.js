/* write summary of all the valid participants in this batch, combining useful information from workers.js and questionnaire.js */

// exclude practice trial
var minBlockNumber = 1;

exports.output = [];
helpers.validParticipants().forEach(function(participant) {

   var shortDurations = [];
   var logShortDurations = [];

   participant.trials.forEach(function(trial) {
      if (helpers.getBlock(trial) >= minBlockNumber) {
         shortDurations.push(trial.duration.short);
         logShortDurations.push(Math.log(1 + trial.duration.short));
      }
   });

   var data = {

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
      "numCorrectAnchorSelected": getNumCorrectHookSelected(participant),
      "averageLogShortDuration": (Math.exp(Math.average(logShortDurations)) - 1).toFixed(1),
      "medianShortDuration": Math.median(shortDurations).toFixed(1),
      // my own classification of problematic participants, to see the impact of the num of errors and duration
      "problems": printProblem(participant),

      /* durations */

      // time it took participants to complete all steps of the tutorial
      "tutorialDuration": helpers.getTutorialDuration(participant).toFixed(1),
      // time it took participants to complete all the trials of the experiment
      "trialsDuration": helpers.getTrialsDuration(participant).toFixed(0),
   }

   if (!within) {
      // time it took participants to reach the final page, in minutes
      data.totalDuration = helpers.getTotalDuration(participant).toFixed(0);

      /* feedback */

      data.bugFeedback = helpers.formatStringForCSV(participant.questionnaires.bugFeedback);
      data.interfaceFeedback = helpers.formatStringForCSV(participant.questionnaires.preference.feedback);
      data.generalFeedback = helpers.formatStringForCSV(participant.questionnaires.additionalFeedback);

      // base rate + bonus for that participant, if any
      data.payment = helpers.getPayment(participant);
   }

   exports.output.push(data);
});

if (within)
   helpers.sortByParticipantID(exports.output);
else
   helpers.sortByConditionThenTimestamp(exports.output);

function getNumCorrectHookSelected(participant) {
   return participant.trials.filter(function(trial) {
      return helpers.getBlock(trial) >= minBlockNumber && trial.correctHookHasBeenSelected;
   }).length;
}

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

function printProblem(participant) {
   switch (problems[participant.id]) {
      case 2:
         return "MAJOR";
      case 1:
         return "minor";
      case 0.9:
         return "duplicate";
      case 0.5:
         return "unsure";
      default:
         return "";
   }
}


// print some summary statistics to the console
console.log("Average [geom] tutorial duration (mm.ss):", printFormattedMeanDurations(helpers.getTutorialDuration));
console.log("Average [geom] trials duration (mm.ss):", printFormattedMeanDurations(helpers.getTrialsDuration));
console.log("Average [geom] total duration (mm.ss):", printFormattedMeanDurations(helpers.getTotalDuration));
console.log("Average [geom] payment ($):", printFormattedMeanPayments(helpers.getPayment));
console.log("Average [geom] hourly rate ($/hr):", printFormattedMeanPayments(getHourlyRate));
console.log();
