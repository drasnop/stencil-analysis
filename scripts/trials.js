/* write data for each trial of each valid participant in this batch */

// generate filename
exports.filename = helpers.filename("trials");

// parse data
exports.output = [];
helpers.validParticipants().forEach(function(participant) {

   participant.trials.forEach(function(trial) {

      exports.output.push({

         /* general information about this participant */

         "id": participant.id,
         "defaults": participant.condition.oppositeDefaults ? "opposite" : "",
         "interface": participant.condition.interface,

         /* info about this trial */

         "trialNumber": trial.number,
         "targetOption": trial.targetOption,
         "targetTab": participant.options[trial.targetOption].tab.name,
         "numVisitedTabs": trial.visitedTabs ? trial.visitedTabs.length : 0,
         "correctHookHasBeenSelected": trial.correctHookHasBeenSelected,

         /* outcome */

         "success": trial.success,
         "timeout": trial.timeout,

         /* durations */
         "instructionsDuration": trial.duration.instructions,
         "shortDuration": trial.duration.short,
         "longDuration": trial.duration.long,
         "selectionDuration": trial.duration.selection,
         "selectBetween": trial.duration.selectBetween

      })
   });
});

// sort by condition then participant then trialNumber, to make it easier to read
exports.output.sort(function(workerDataA, workerDataB) {

   if (workerDataA.interface == workerDataB.interface) {
      if (workerDataA.id == workerDataB.id) {
         return workerDataA.trialNumber - workerDataB.trialNumber;
      }
      return helpers.compareAlphaNum(workerDataA.id, workerDataB.id);
   }
   return workerDataA.interface - workerDataB.interface;
})
