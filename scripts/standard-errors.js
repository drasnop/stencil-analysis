/* compute the standard error for each participant, as we increase the number of trials */

// filter data
var minTrialNumber = 0;
var onlySuccess = false;
var onlyCHS = false;

// parse data
exports.output = [];
helpers.validParticipants().forEach(function(participant) {

   /* get ready to compute the standard error of the log duration for each trial of each participant */
   var logShortDurations = [];

   participant.trials.forEach(function(trial) {
      if (trial.number >= minTrialNumber && (!onlySuccess || trial.success) && (!onlyCHS || trial.correctHookHasBeenSelected || participant.condition.interface === 0)) {
         logShortDurations.push(Math.log(1 + trial.duration.short));
      }
   });


   /* general information about this participant */
   var out = {
      "id": participant.id,
      "defaults": participant.condition.oppositeDefaults ? "opposite" : "",
      "interface": participant.condition.interface,
      "interfaceType": participant.condition.interface > 0 ? "customizationMode" : "control",
   }

   /* compute standard error for increasing numbers of trials*/
   for (var i = minTrialNumber + 1; i < participant.trials.length; i++) {
      out[i] = Math.sem(logShortDurations.slice(minTrialNumber, i + 1));
   }

   exports.output.push(out);
});


// sort by condition then participant, to make it easier to read
exports.output.sort(function(workerDataA, workerDataB) {

   if (workerDataA.interface == workerDataB.interface)
      return helpers.compareAlphaNum(workerDataA.id, workerDataB.id);
   else
      return workerDataA.interface - workerDataB.interface;
})
