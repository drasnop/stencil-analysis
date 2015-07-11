/* compute the standard error of the mean for each interface type, as we increase the number of trials */

// generate filename
exports.filename = helpers.filename("standard-error");
exports.output = [];

// filter data
var minTrialNumber = 0;

// get ready to compute the standard error of the log duration for each trial, across all participants
var types = ["control", "customizationMode"];
var logShortDurations = {
   "control": [],
   "customizationMode": []
};
var participants = helpers.validParticipants();

var n = helpers.getNumTrials(participants);
var index;

for (var i = minTrialNumber; i < n; i++) {
   logShortDurations["control"][i] = [];
   logShortDurations["customizationMode"][i] = [];

   // participants is an object indexed by string ids, but the durations should be stored in an array
   index = 0;
   for (var j in participants) {
      var type = participants[j].condition.interface > 0 ? "customizationMode" : "control";
      logShortDurations[type][i][index] = Math.log(1 + helpers.getTrial(participants[j], i).duration.short);
      index++;
   }
}

// average log duration at each trial, splitted by interface type
for (var t in types) {
   var out = {};
   for (var i = minTrialNumber; i < n; i++) {
      out[i] = Math.average(logShortDurations[types[t]][i]);
   }
   exports.output.push(out);
}


// standard error of the mean at each trial, depending on the interface type
for (var t in types) {
   var out = {};
   for (var i = minTrialNumber; i < n; i++) {
      out[i] = Math.sem(logShortDurations[types[t]][i]);
   }
   exports.output.push(out);
}
