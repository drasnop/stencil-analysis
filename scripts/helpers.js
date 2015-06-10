/* helper functions for enumerating the data and writing csv files */

// standardized filename and location for all parsing scripts
exports.filename = function(name) {
   return batch + "/" + name + "-" + batch + ".csv";
}


// check if one worker completed the entire experiment (does not check for duplicates)
exports.isComplete = function(worker) {
   // filter out people who did not complete the tutorial (minimum number of steps is 14)
   if (!worker.tutorial || Object.keys(worker.tutorial).length < 14)
      return false;

   // filter out people who did not complete the experiment
   if (!worker.trials || Object.keys(worker.trials).length < 10)
      return false;

   // filter out people who did not complete all the questionnaires
   if (!worker.questionnaires || !worker.questionnaires.recognition || !worker.questionnaires.preference || !worker.questionnaires.demographics)
      return false;

   return true;
}

// check if one worker tried to participate multiple times (does not check for validity)
exports.isDuplicate = function(worker) {
   var seenBefore = false;

   for (var i in input) {
      if (input[i].info.worker_id == worker.info.worker_id) {
         if (seenBefore)
            return true;
         else
            seenBefore = true;
      }
   }

   return false;
}


// filters out all the incomplete participants in this batch
exports.completeParticipants = function() {
   return input.filter(function(worker) {
      return exports.isComplete(worker);
   })
}

// indicate which participants tried to do the experiment multiple times (even if it was never valid)
// NB: calling input.filter(isDuplicate) would cause the output to contain... duplicates!
exports.duplicateParticipants = function() {
   var participantsIds = [];
   var duplicatesIds = []
   var duplicates = [];

   input.forEach(function(worker) {
      if (participantsIds.indexOf(worker.info.worker_id) > 0) {
         // if we haven't seen this duplicate yet, add it
         if (duplicatesIds.indexOf(worker.info.worker_id) < 0) {
            duplicatesIds.push(worker.info.worker_id)
            duplicates.push(worker);
         }
      } else
         participantsIds.push(worker.info.worker_id);
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




/* add useful methods to all objects */


Object.defineProperty(Object.prototype, "forEach", {
   value: function(callback) {
      Object.keys(this).forEach(function(key) {
         callback(this[key]);
      }, this)
   }
})

Object.defineProperty(Object.prototype, "filter", {
   value: function(test) {
      var filtered = {};
      Object.keys(this).forEach(function(key) {
         if (test(this[key]))
            filtered[key] = this[key];
      }, this)
      return filtered;
   }
})

Object.defineProperty(Object.prototype, "map", {
   value: function(transform) {
      var mapped = [];
      Object.keys(this).forEach(function(key) {
         mapped.push(transform(this[key]));
      }, this)
      return mapped;
   }
})
