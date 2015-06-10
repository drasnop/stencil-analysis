var inputFilepath = 'mturk/0-12.json';
var outputFilepath = 'durations/durations-conditions-0-12.csv';
var fs = require('fs');

Object.defineProperty(Object.prototype, "forEach", {
   value: function(callback) {
      Object.keys(this).forEach(function(key) {
         callback(this[key]);
      }, this)
   }
})

// parse data for one user
var mturk = JSON.parse(fs.readFileSync(inputFilepath, 'utf8'));
console.log("Results file parsed: ", inputFilepath)

// prepare write in csv
var stream = fs.createWriteStream(outputFilepath);
stream.writeCsvLine = function(array) {
   stream.write(array.join(",") + "\n")
}

// loop through the data and write relevant portions in the output file
stream.once('open', function(fd) {
   stream.writeCsvLine(["interface", "shortDuration", "longDuration"])

   var validParticipants = [];
   var conditionsShortDurations = [0, 0, 0, 0];
   var conditionsLongDurations = [0, 0, 0, 0];
   var usersPerCondition = [0, 0, 0, 0];

   mturk.forEach(function(user) {

      // filter out people who did not complete the experiment
      if (!user.tutorial || !user.trials) {
         console.log("Failure: user", user.info.worker_id, "did not complete the experiment.")
         return;
      }
      if (Object.keys(user.trials).length < 10) {
         console.log("Failure: user", user.info.worker_id, "completed only", Object.keys(user.trials).length, "trials")
         return;
      }

      // check for duplicate
      if (validParticipants.indexOf(user.info.worker_id) > 0) {
         console.log("Failure: user", user.info.worker_id, "participated more than once")
         return;
      }

      console.log("Success! user", user.info.worker_id, "completed the experiment successfully")
      validParticipants.push(user.info.worker_id);

      // compute average duration of this participant's trials
      var short = 0,
         long = 0;
      user.trials.forEach(function(trial) {
         short += trial.duration.short;
         long += trial.duration.long;
      })
      short = short / Object.keys(user.trials).length;
      long = long / Object.keys(user.trials).length;

      // add them
      conditionsShortDurations[user.condition.interface] += short;
      conditionsLongDurations[user.condition.interface] += long;
      usersPerCondition[user.condition.interface] += 1;
   });

   // compute and write the average durations per condition
   for (var i = 0; i < conditionsShortDurations.length; i++) {
      conditionsShortDurations[i] = conditionsShortDurations[i] / usersPerCondition[i];
      conditionsLongDurations[i] = conditionsLongDurations[i] / usersPerCondition[i];
      stream.writeCsvLine([i, conditionsShortDurations[i], conditionsLongDurations[i]])
   }

   console.log(validParticipants.length, "valid participants");

   stream.end();
   console.log("output written in: ", outputFilepath)
});
