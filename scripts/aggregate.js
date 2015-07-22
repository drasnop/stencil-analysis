/* compile data for each participant, to be used in ANOVA */

// filter data
var minTrialNumber = 1;
var onlySuccess = true;
var onlyCHS = false;
var useMedian = true;


// parse data
exports.output = [];
helpers.validParticipants().forEach(function(participant) {

   /* get ready to compute the average or the median of durations for each trial of each participant */

   var instructionsDurations = [];
   var shortDurations = [];
   var logShortDurations = [];
   var longDurations = [];

   participant.trials.forEach(function(trial) {
      if (trial.number >= minTrialNumber && (!onlySuccess || trial.success) && (!onlyCHS || trial.correctHookHasBeenSelected || participant.condition.interface === 0)) {
         instructionsDurations.push(trial.duration.instructions);
         shortDurations.push(trial.duration.short);
         logShortDurations.push(Math.log(1 + trial.duration.short));
         longDurations.push(trial.duration.long);
      }
   });

   var centralTendency = useMedian ? Math.median : Math.average;

   exports.output.push({

      /* general information about this participant */

      "id": participant.id,
      "defaults": participant.condition.oppositeDefaults ? "opposite" : "",
      "interface": participant.condition.interface,
      "interfaceType": participant.condition.interface > 0 ? "customizationMode" : "control",

      /* durations */

      "tutorialDuration": computeAverageTutorialDuration(participant),

      "instructionsDuration": centralTendency(instructionsDurations),
      "shortDuration": centralTendency(shortDurations),
      "logShortDuration": Math.exp(centralTendency(logShortDurations)) - 1,
      "longDuration": centralTendency(longDurations),

      "averageShortDuration": Math.average(shortDurations),
      "averageLogShortDuration": Math.exp(Math.average(logShortDurations)) - 1,

      /* accuracy */

      "numTimeouts": helpers.getNumTimeouts(participant),
      "numSuccesses": helpers.getNumSuccesses(participant),
      "numErrors": totalNumTrials - helpers.getNumSuccesses(participant)
   })


   function computeAverageTutorialDuration(participant) {
      var tutorialSteps = [];
      participant.tutorial.forEach(function(step) {
         tutorialSteps.push(step.duration);
      });
      return centralTendency(tutorialSteps);
   }

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
