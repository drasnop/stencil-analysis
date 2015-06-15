// > node scripts/participant-durations.js
var inputFilepath = 'pilots/kamyar-pilot.json';
var outputFilepath = 'pilots/durations/kamyar-durations.csv';
var fs = require('fs');

Object.defineProperty(Object.prototype, "forEach", {
   value: function(callback) {
      Object.keys(this).forEach(function(key) {
         callback(this[key]);
      }, this)
   }
})

// parse data for one user
var user = JSON.parse(fs.readFileSync(inputFilepath, 'utf8'));
console.log("Results file parsed: ", inputFilepath)

// prepare write in csv
var stream = fs.createWriteStream(outputFilepath);
stream.writeCsvLine = function(array) {
   stream.write(array.join(",") + "\n")
}

// utility functions for writing trial data
stream.writeTrialLine = function(trial, array) {
   var info = [trial.number, trial.targetOption]
   stream.writeCsvLine(info.concat(array))
}
stream.writeTrialsHeaders = function(array) {
   var info = ["trialNumber", "targetOption"]
   stream.writeCsvLine(info.concat(array))
}

// loop through the data and write relevant portions in the output file
stream.once('open', function(fd) {
   stream.writeTrialsHeaders(["shortDuration", "longDuration"])

   user.trials.forEach(function(trial) {
      stream.writeTrialLine(trial, [trial.duration.short, trial.duration.long])
   })

   stream.end();
   console.log("output written in: ", outputFilepath)
});
