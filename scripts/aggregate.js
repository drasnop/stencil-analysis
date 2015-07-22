/* compile data for each participant, to be used in ANOVA */

// filter data
var minTrialNumber = 1;
var onlySuccess = true;
var onlyCHS = false;
var maxProblemTolerated = 0;

// parse data
exports.output = [];
helpers.validParticipants().forEach(function(participant) {

   if (problems[participant.id] > maxProblemTolerated)
      return;

   /* get ready to compute the average or the median of durations for each trial of each participant */

   var instructionsDurations = [];
   var shortDurations = [];
   var longDurations = [];
   var logShortDurations = [];
   var logLongDurations = [];

   participant.trials.forEach(function(trial) {
      if (trial.number >= minTrialNumber && (!onlySuccess || trial.success) && (!onlyCHS || trial.correctHookHasBeenSelected || participant.condition.interface === 0)) {
         instructionsDurations.push(trial.duration.instructions);
         shortDurations.push(trial.duration.short);
         longDurations.push(trial.duration.long);
         logShortDurations.push(Math.log(1 + trial.duration.short));
         logLongDurations.push(Math.log(1 + trial.duration.long));
      }
   });

   function computeAverageTutorialDuration(participant) {
      var tutorialSteps = [];
      participant.tutorial.forEach(function(step) {
         tutorialSteps.push(step.duration);
      });
      return Math.average(tutorialSteps);
   }


   exports.output.push({

      /* general information about this participant */

      "id": participant.id,
      "defaults": participant.condition.oppositeDefaults ? "opposite" : "",
      "interface": participant.condition.interface,
      "interfaceType": participant.condition.interface > 0 ? "customizationMode" : "control",

      /* durations */

      "tutorialDuration": computeAverageTutorialDuration(participant),
      "instructionsDuration": Math.average(instructionsDurations),

      "averageShortDuration": Math.average(shortDurations),
      "medianShortDuration": Math.median(shortDurations),
      "averageLogShortDuration": Math.exp(Math.average(logShortDurations)) - 1,

      "averageLongDuration": Math.average(longDurations),
      "medianLongDuration": Math.median(longDurations),
      "averageLogLongDuration": Math.exp(Math.average(logLongDurations)) - 1,

      /* accuracy */

      "numTimeouts": helpers.getNumTimeouts(participant),
      "numSuccesses": helpers.getNumSuccesses(participant),
      "numErrors": totalNumTrials - helpers.getNumSuccesses(participant)
   })
});


helpers.sortByConditionThenParticipant(exports.output)


// print some summary statistics to the console
console.log(exports.output.length + " participants")
for (var i = 0; i <= 3; i++) {
   var count = exports.output.filter(filterByInterface).length;
   console.log("interface " + i + ": " + count + " participants")
}
console.log()

function filterByInterface(participant) {
   return participant.interface === i;
}
