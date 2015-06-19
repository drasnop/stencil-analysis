// > node scripts/participant-durations.js
var inputFilepath = 'pilots/pax-pilot-preformatted.json';
var outputFilepath = 'pilots/pax-pilot-reformatted.json';
var fs = require('fs');

Object.defineProperty(Object.prototype, "forEach", {
   value: function(callback) {
      Object.keys(this).forEach(function(key) {
         callback(this[key]);
      }, this)
   }
})

// parse data
var users = JSON.parse(fs.readFileSync(inputFilepath, 'utf8'));
console.log("Results file parsed: ", inputFilepath)

users.pax.trials.forEach(function(trial) {
   trial.duration = {
      "instructions": trial.instructionsDuration,
      "short": trial.shortDuration,
      "long": trial.longDuration,
      "total": trial.totalDuration,
      "selection": 0,
      "selectBetween": 0
   }

   delete trial.instructionsDuration;
   delete trial.shortDuration;
   delete trial.longDuration;
   delete trial.totalDuration;

   trial.targetOption = trial.targetOption.id;
})


// write JSON to file
fs.writeFile(outputFilepath, JSON.stringify(users, null, 2), function(err) {
   if (err) {
      console.log(err);
   } else {
      console.log("JSON saved to " + outputFilepath);
   }
});
