/* helper functions for enumerating the data and writing csv files */

// add a convenient enumaration method to all objects
Object.defineProperty(Object.prototype, "forEach", {
   value: function(callback) {
      Object.keys(this).forEach(function(key) {
         callback(this[key]);
      }, this)
   }
})

// standardized filename and location for all parsing scripts
exports.filename = function(name) {
   return batch + "/" + name + "-" + batch + ".csv";
}

// filters out all the invalid participants in this batch
exports.validParticipants = function() {
   var validParticipants = [];

   input.forEach(function(worker) {

      // filter out people who did not complete the tutorial (minimum number of steps is 14)
      if (!worker.tutorial || Object.keys(worker.tutorial).length < 12)
         return;

      // filter out people who did not complete the experiment
      if (!worker.trials || Object.keys(worker.trials).length < 10)
         return;

      // filter out people who did not complete all the questionnaires
      if (!worker.questionnaires || !worker.questionnaires.recognition || !worker.questionnaires.preference || !worker.questionnaires.demographics)
         return;

      // check for duplicate
      if (validParticipants.indexOf(worker) > 0)
         return;

      validParticipants.push(worker);
   })

   return validParticipants;
}

// indicate which participants tried to do the experiment multiple times (even if it was never valid)
exports.duplicateParticipants = function() {
   var participants = [];
   var duplicates = [];

   input.forEach(function(worker) {

      if (duplicates.indexOf(worker) > 0) {
         duplicates.push(worker);
         return;
      }

      // keep track of all the workers seen so far
      participants.push(worker);
   });

   return duplicates;
}


// write an entire csv file at once, from a 2D array of data
exports.writeCsvFile = function(filename, data) {

   var csv = data.map(function(line) {
      return line.join(",");
   })

   csv = csv.join("\n");


   fs.writeFile(filename, csv, function(err) {
      if (err) {
         return console.log(err);
      }
      console.log("output written in: ", filename);
   })

}
