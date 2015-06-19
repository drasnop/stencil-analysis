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


exports.getPayment = function(worker) {
   return basePayment + exports.getBonus(worker);
}

exports.getBonus = function(worker) {
   var bonus = 0

   bonus += bonusPerTrial * Object.keys(worker.trials.filter(function(trial) {
      return trial.success;
   })).length;

   bonus += Math.max(0, (2 * worker.questionnaires.recognition.tabs.score - 10) * bonusPerTab);
   bonus += Math.max(0, (2 * worker.questionnaires.recognition.options.score - 20) * bonusPerOption);

   return bonus;
}

// trials are stored with a unique key automatically generated by Firebase
exports.getTrial = function(participant, trialNumber) {
   for (var key in participant.trials) {
      if (participant.trials[key].number == trialNumber)
         return participant.trials[key];
   }
   return false;
}

exports.getSelector = function(option_id) {
   for (var i in mappings) {
      if (mappings[i].options.indexOf(option_id) >= 0)
         return mappings[i].selector;
   }
   return false;
}

// returns an array containing the unique elements of the argument
exports.unique = function(array) {
   var count = [];
   array.forEach(function(key) {
      count[key] = count[key] ? count[key] + 1 : 1;
   })
   return Object.keys(count);
}

/* methods for writing output csv files */


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
   writeFile(filename, csv);
}

// write some content in a file, creating directories if needed
function writeFile(filename, content) {
   /*   var mkdirp = require("mkdirp")
      var getDirName = require("path").dirname

      mkdirp(getDirName(filename), function(err) {
         if (err)
            return console.log(err);*/

   fs.writeFile(filename, content, function(err) {
      if (err) {
         return console.log(err);
      }
      console.log("output written in: ", filename);
   });
   //})
}

// wrap string in double-quotes to allow commas, after replacing internal " by '
exports.formatStringForCSV = function(string) {
   if (!string)
      return "";
   return '"' + string.split('"').join("'") + '"';
}

// compare two alphanumeric strings
exports.compareAlphaNum = function(a, b) {
   var reA = /[^a-zA-Z]/g;
   var reN = /[^0-9]/g;

   var aA = a.replace(reA, "");
   var bA = b.replace(reA, "");

   if (aA === bA) {
      var aN = parseInt(a.replace(reN, ""), 10);
      var bN = parseInt(b.replace(reN, ""), 10);
      return aN === bN ? 0 : aN > bN ? 1 : -1;
   } else {
      return aA > bA ? 1 : -1;
   }
}

// computes the median of an array of values
Math.median = function(values) {
   values.sort(function(a, b) {
      return a - b;
   });

   var half = Math.floor(values.length / 2);

   if (values.length % 2)
      return values[half];
   else
      return (values[half - 1] + values[half]) / 2.0;
}

// computes the average of an array of values
Math.average = function(values) {
   return values.reduce(function(previousValue, currentValue) {
      return previousValue + currentValue;
   }, 0) / values.length;
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

Object.defineProperty(Object.prototype, "reduce", {
   // compute(previousValue, currentValue)
   value: function(compute, initialValue) {
      var result = initialValue;
      Object.keys(this).forEach(function(key) {
         result = compute(result, this[key]);
      }, this)
      return result;
   }
})

exports.convertOldPilotData = function() {
   for (var id in input) {

      // batch 0-12
      if (!input[id].id) {

         // add id
         input[id].id = id;

         // add fake timestamp
         input[id].info.timestamp = 0;
      }
   }
}
