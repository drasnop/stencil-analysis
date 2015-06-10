/* helper functions for enumerating the data and writing csv files */

// standardized filename and location for all parsing scripts
exports.filename = function(name) {
   return batch + "/" + name + "-" + batch + ".csv";
}

// check if a worker has completed the experiment only once (can still be a duplicate, but only completing once)
exports.isValid = function(worker) {
   return exports.isComplete(worker) && !exports.isBadDuplicate(worker);
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

// check if one worker did the experiment multiple times
// NB: criteria is tutorial started, not trials.length >= 1, because they may have abandonned in the 1st trial
exports.isBadDuplicate = function(worker) {

   // this worker hasn't even started the tutorial
   if (!worker.tutorial)
      return false;

   // Look for at least two instances in which they started the tutorial
   var startedTutorialBefore = false;

   for (var i in input) {
      if (input[i].info.worker_id == worker.info.worker_id) {
         if (startedTutorialBefore && input[i].tutorial)
            return true;
         else if (input[i].tutorial)
            startedTutorialBefore = true;
      }
   }

   return false;
}


// get all the workers in this batch who at least started the tutorial (not unique)
exports.startedTutorialButNotCompleteParticipants = function() {
   return input.filter(function(worker) {
      return worker.tutorial && !exports.isComplete(worker);
   })
}

// get all the duplicate participants in this batch (not unique)
exports.duplicateParticipants = function() {
   return input.filter(function(worker) {
      return exports.isDuplicate(worker);
   })
}

// get all the bad duplicate participants in this batch (not unique?)
exports.badDuplicateParticipants = function() {
   return input.filter(function(worker) {
      return exports.isBadDuplicate(worker);
   })
}

// filters out all the incomplete participants in this batch
exports.completeParticipants = function() {
   return input.filter(function(worker) {
      return exports.isComplete(worker);
   })
}

// filters out all the invalid participants in this batch
exports.validParticipants = function() {
   return input.filter(function(worker) {
      return exports.isValid(worker);
   })
}

// indicate which participants tried to do the experiment multiple times (even if it was never valid)
// NB: calling input.filter(isDuplicate) would cause the output to contain... duplicates!
exports.uniqueDuplicateParticipants = function() {
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


// convert array of JSON objects into a multi-line csv representation
function JSONtoCSV(data) {

   var array = [];

   // headers are the keys of each JSON object
   array.push(Object.keys(data[0]))

   // flatten the JSON into an array representation
   data.forEach(function(JSONline) {
      array.push(Object.keys(JSONline).map(function(key) {
         return JSONline[key];
      }))
   });

   return ArrayToCSV(array);
}

// convert a 2D array into a multi-line csv representation
function ArrayToCSV(data) {
   var csv = data.map(function(line) {
      return line.join(",");
   })

   return csv.join("\n");
}

// write an entire csv file at once, from a JSON object
exports.writeJSONtoCSVfile = function(filename, data) {
   var csv = JSONtoCSV(data);

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
