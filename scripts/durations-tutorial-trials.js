var inputFilepath = 'mturk/0-12.json';
var outputFilepath = 'durations/durations-tutorial-trials-0-12.csv';
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

// utility functions for writing trial data
stream.writeUserLine = function(user, array) {
   var info = [user.info.worker_id, user.condition.interface, user.condition.oppositeDefaults]
   stream.writeCsvLine(info.concat(array))
}
stream.writeUserHeaders = function(array) {
   var info = ["workerId", "interface", "oppositeDefaults"]
   stream.writeCsvLine(info.concat(array))
}

// loop through the data and write relevant portions in the output file
stream.once('open', function(fd) {
   stream.writeUserHeaders(["tutorialDuration", "trialsDuration"])

   var validParticipants = [];

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

      // compute average tutorial duration
      var tutorialDuration = 0;
      user.tutorial.forEach(function(trial) {
         tutorialDuration += trial.duration;
      })
      tutorialDuration = tutorialDuration / Object.keys(user.tutorial).length;

      // compute average trial duration
      var longDuration = 0;
      user.trials.forEach(function(trial) {
         longDuration += trial.duration.long;
      })
      longDuration = longDuration / Object.keys(user.trials).length;

      console.log("Success! user", user.info.worker_id, "completed the experiment successfully")
      validParticipants.push(user.info.worker_id);

      stream.writeUserLine(user, [tutorialDuration, longDuration])
   });

   console.log(validParticipants.length, "valid participants");

   stream.end();
   console.log("output written in: ", outputFilepath)
});
