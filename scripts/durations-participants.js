/* compile duration data for each participant, to be used in ANOVA */

// generate filename
exports.filename = helpers.filename("durations-participants");

// filter data
var minTrialNumber = 2;
var onlySuccess = true;
var useMedian = true;


// parse data
exports.output = [];
helpers.validParticipants().forEach(function(participant) {

   /* get ready to compute the average or the median of durations for each participant */

   var instructionsDurations = [];
   var shortDurations = [];
   var longDurations = [];

   participant.trials.forEach(function(trial) {
      if (trial.number >= minTrialNumber && (trial.success || !onlySuccess)) {
         instructionsDurations.push(trial.duration.instructions);
         shortDurations.push(trial.duration.short);
         longDurations.push(trial.duration.long);
      }
   });

   var centralTendency = useMedian ? Math.median : Math.average;

   console.log(shortDurations.sort(function(a, b) {
      return a - b;
   }))
   console.log(centralTendency(shortDurations))

   exports.output.push({

      /* general information about this participant */

      "id": participant.id,
      "defaults": participant.condition.oppositeDefaults ? "opposite" : "",
      "interface": participant.condition.interface,
      "interfaceType": participant.condition.interface > 0 ? "customizationMode" : "settingsPanel",

      /* durations */

      "instructionsDuration": centralTendency(instructionsDurations),
      "shortDuration": centralTendency(shortDurations),
      "longDuration": centralTendency(longDurations)
   })
});

// add Pax's pilot data
exports.output.push({

   /* general information about this participant */

   "id": "pax",
   "defaults": "",
   "interface": 3,
   "interfaceType": "customizationMode",

   /* durations */

   "instructionsDuration": 5,
   "shortDuration": 15.04571216,
   "longDuration": 16.88699629
})


// sort by condition then participant, to make it easier to read
exports.output.sort(function(workerDataA, workerDataB) {

   if (workerDataA.interface == workerDataB.interface)
      return helpers.compareAlphaNum(workerDataA.id, workerDataB.id);
   else
      return workerDataA.interface - workerDataB.interface;
})
