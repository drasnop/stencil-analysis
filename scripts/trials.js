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

         /* outcome */

         "success": trial.success,
         "timeout": trial.timeout,

         /* durations */
         "instructions": trial.duration.instructions,
         "short": trial.duration.short,
         "long": trial.duration.long,
         "selection": trial.duration.selection,
         "selectBetween": trial.duration.selectBetween

      })
   });
});

// sort by condition then participant then trialNumber, to make it easier to read
exports.output.sort(function(workerDataA, workerDataB) {

   if (workerDataA.interface == workerDataB.interface) {
      if (workerDataA.worker_id == workerDataB.worker_id) {
         return workerDataA.trialNumber - workerDataB.trialNumber;
      }
      return helpers.compareAlphaNum(workerDataA.worker_id, workerDataB.worker_id);
   }
   return workerDataA.interface - workerDataB.interface;
})
