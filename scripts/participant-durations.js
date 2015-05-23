// > node scripts/results-parser.js
var inputFilepath = 'json/pax-pilot.json';
var outputFilepath = 'csv/durations.csv';
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

stream.once('open', function(fd) {
   stream.writeCsvLine(["shortDuration", "longDuration"])

   user.trials.forEach(function(trial) {
      stream.writeCsvLine([trial.shortDuration, trial.longDuration])
   })

   stream.end();
});
