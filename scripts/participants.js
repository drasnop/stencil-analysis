/* write summary of all the valid participants in this batch, combining useful information from workers.js and questionnaire.js */

exports.output = [];
helpers.validParticipants().forEach(function(participant) {

   exports.output.push({

      /* general information about this participant */

      "id": participant.id,
      "participant_id": participant.info.participant_id,
      "assignment_id": participant.info.assignment_id,
      "OS": participant.info.apparatus.os,
      "browser": participant.info.apparatus.browser,
      "defaults": participant.condition.oppositeDefaults ? "opposite" : "",
      "interface": participant.condition.interface,


      /* durations */

      // time it took participants to complete all steps of the tutorial
      "tutorialDuration": helpers.getTutorialDuration(participant),

      // time it took participants to complete all the trials of the experiment
      "trialsDuration": helpers.getTrialsDuration(participant),

      // time it took participants to reach the final page, in minutes
      "totalDuration": helpers.getTotalDuration(participant),

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
