/* compile data for each participant, to be used in ANOVA */

// filter data
var onlySuccess = false;
var onlyNonGhost = false;
var onlyCHS = false;

// parse data
exports.output = [];
helpers.validParticipants().forEach(function(participant) {

   /* get ready to compute the average or the median of durations for each trial of each participant, for block 0, 1 and 2 */

   var instructionsDurations = [
      [],
      [],
      []
   ];
   var shortDurations = [
      [],
      [],
      []
   ];
   var longDurations = [
      [],
      [],
      []
   ];
   var logShortDurations = [
      [],
      [],
      []
   ];
   var logLongDurations = [
      [],
      [],
      []
   ];

   participant.trials.forEach(function(trial) {
      if ((!onlySuccess || trial.success) && (!onlyCHS || trial.correctHookHasBeenSelected || participant.condition.interface === 0) && (!onlyNonGhost || !helpers.getChangedOptionPropertyAsNumber(trial, "ghost"))) {
         var block = helpers.getBlock(trial);

         instructionsDurations[block].push(trial.duration.instructions);
         shortDurations[block].push(trial.duration.short);
         longDurations[block].push(trial.duration.long);
         logShortDurations[block].push(Math.log(1 + trial.duration.short));
         logLongDurations[block].push(Math.log(1 + trial.duration.long));
      }
   });

   function computeAverageTutorialDuration(participant) {
      var tutorialSteps = [];
      participant.tutorial.forEach(function(step) {
         tutorialSteps.push(step.duration);
      });
      return Math.average(tutorialSteps);
   }

   for (var block = 0; block < numBlocks; block++) {
      exports.output.push({

         /* general information about this participant */

         "id": participant.id,
         "problems": problems[participant.id],
         "defaults": participant.condition.oppositeDefaults ? "opposite" : "",
         "interface": participant.condition.interface,
         "interfaceType": participant.condition.interface > 0 ? "customizationMode" : "control",
         "block": block,

         /* durations */

         "tutorialDuration": computeAverageTutorialDuration(participant),
         "instructionsDuration": Math.average(instructionsDurations[block]),

         "averageShortDuration": Math.average(shortDurations[block]),
         "medianShortDuration": Math.median(shortDurations[block]),
         "averageLogShortDuration": Math.exp(Math.average(logShortDurations[block])) - 1,

         "averageLongDuration": Math.average(longDurations[block]),
         "medianLongDuration": Math.median(longDurations[block]),
         "averageLogLongDuration": Math.exp(Math.average(logLongDurations[block])) - 1,

         /* accuracy */

         "numTimeouts": helpers.getNumTimeouts(participant),
         "numSuccesses": helpers.getNumSuccesses(participant),
         "numErrors": totalNumTrials - helpers.getNumSuccesses(participant)
      })
   }
});


helpers.sortByConditionThenParticipantID(exports.output)


// print some summary statistics to the console
console.log(exports.output.length / numBlocks + " participants x " + numBlocks + " blocks")
for (var i = 0; i <= numBlocks; i++) {
   var counts = "";
   for (var j = 0; j <= 2; j++) {
      counts += exports.output.filter(filterByInterfaceAndBlock).length + " ";
   }
   console.log("interface " + i + ": " + counts + "participants")
}
console.log()

function filterByInterfaceAndBlock(participant) {
   return participant.interface === i && participant.block === j;
}
