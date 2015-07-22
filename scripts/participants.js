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


function getAverageValueForValidParticipants(getter) {
   return Math.average(helpers.validParticipants().map(function(participant) {
      return getter(participant);
   }))
}

// print some summary statistics to the console
console.log("Average tutorial duration (mm.ss):", helpers.formatMinuteSeconds(getAverageValueForValidParticipants(helpers.getTutorialDuration)));
console.log("Average trials duration (mm.ss):", helpers.formatMinuteSeconds(getAverageValueForValidParticipants(helpers.getTrialsDuration)));
console.log("Average total duration (mm.ss):", helpers.formatMinuteSeconds(getAverageValueForValidParticipants(helpers.getTotalDuration)));
console.log("Average payment ($):", getAverageValueForValidParticipants(helpers.getPayment).toFixed(2));
console.log("Average hourly rate ($/hr):", (getAverageValueForValidParticipants(helpers.getPayment) / getAverageValueForValidParticipants(helpers.getTotalDuration) * 60).toFixed(2));
console.log();
