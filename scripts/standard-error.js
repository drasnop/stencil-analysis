/* compute the standard error of the mean for each interface type, as we increase the number of trials */

exports.output = [];

// filter data
var minTrialNumber = 2;

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
var out;
var averages = {
   "control": [],
   "customizationMode": []
};
for (var t in types) {
   out = {};
   for (var i = minTrialNumber; i < n; i++) {
      averages[types[t]][i] = Math.average(logShortDurations[types[t]][i]);
      out[i] = averages[types[t]][i];
   }
   exports.output.push(out);
}

// standard error of the mean at each trial, depending on the interface type
for (var t in types) {
   out = {};
   for (var i = minTrialNumber; i < n; i++) {
      out[i] = Math.sem(logShortDurations[types[t]][i]);
   }
   exports.output.push(out);
}

// standard error of the mean as the number of trials increases, depending on the interface type
for (var t in types) {
   out = {};
   for (var i = minTrialNumber; i < n; i++) {
      var subset = [];
      for (var j = minTrialNumber; j <= i; j++)
         subset = subset.concat(logShortDurations[types[t]][j])

      out[i] = Math.sem(subset);
   }
   exports.output.push(out);
}

// standard error of the mean computed from all trials of all participants, as the number of trials increases
// meh, it is as if we had n*numTrials unique participants, instead of n...

for (var t in types) {
   out = {};
   for (var i = minTrialNumber; i < n; i++) {
      var subset = averages[types[t]].slice(minTrialNumber, i + 1)
      out[i] = Math.sem(subset);
   }
   exports.output.push(out);
}

// standard error of the mean, computed from the individual means of participants refined as the number of trials increases
// this estimate is closer to how we will run the ANOVA (between-subjects, not RM)

// 1. compute average duration per participant, with increasing number of trials
var means = {
   "control": [],
   "customizationMode": []
};
out1 = {};
out2 = {};
for (var i = minTrialNumber; i < n; i++) {
   means["control"][i] = [];
   means["customizationMode"][i] = [];

   var index = 0;
   for (var j in participants) {
      //console.log(i, j, index)
      var type = participants[j].condition.interface > 0 ? "customizationMode" : "control";
      means[type][i][index] = Math.average(participants[j].trials.map(function(trial) {
         return Math.log(1 + trial.duration.short);
      }).slice(minTrialNumber, i + 1))
      index++;
   }

   out1[i] = Math.average(means["control"][i])
   out2[i] = Math.average(means["customizationMode"][i])
}
exports.output.push(out1)
exports.output.push(out2)

// 2. compute standard error for each number of trials
for (var t in types) {
   out = {};
   for (var i = minTrialNumber; i < n; i++) {
      out[i] = Math.sem(means[types[t]][i]);
   }
   exports.output.push(out);
}
