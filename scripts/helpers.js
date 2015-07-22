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
   if (!worker.trials || worker.trials.length < 10)
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

exports.getTutorialDuration = function(worker) {
   // compute duration in seconds
   var duration = worker.tutorial.reduce(function(duration, step) {
      return duration + step.duration;
   }, 0)

   // return helpers.formatMinuteSeconds(duration);
   return duration / 60;
}

exports.getTrialsDuration = function(worker) {
   // compute duration in seconds
   var duration = worker.trials.reduce(function(duration, trial) {
      return duration + trial.duration.total;
   }, 0)

   // return helpers.formatMinuteSeconds(duration);
   return duration / 60;
}

exports.getTotalDuration = function(worker) {
   // compute duration in seconds
   var duration = worker.instructions.reduce(function(duration, page) {
      return duration + page.duration;
   }, 0)

   // return helpers.formatMinuteSeconds(duration);
   return duration / 60;
}


exports.getPayment = function(worker) {
   return basePayment + exports.getBonus(worker);
}

exports.getBonus = function(worker) {
   var bonus = 0

   bonus += bonusPerTrial * worker.trials.filter(function(trial) {
      return trial.number >0 && trial.success;
   }).length;

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
   for (var i in wunderlist.mappings) {
      if (wunderlist.mappings[i].options.indexOf(option_id) >= 0)
         return wunderlist.mappings[i].selector;
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

// @input: duration in minutes (float)
// return duration formatted as minutes.seconds
exports.formatMinuteSeconds = function(duration) {
   var minutes = Math.floor(duration / 60);
   var seconds = Math.floor(duration) % 60;
   return minutes + seconds / 100;
}

// return either the first correctly changed option, or the last one
exports.getMostInformativeChangedOption = function(trial) {
   for (var i in trial.changedOptions) {
      if (trial.changedOptions[i].correct && trial.changedOptions[i].firstTime)
         return trial.changedOptions[i];
   }
   // no success
   return trial.changedOptions[trial.changedOptions.length - 1];
}

// best effort to return a 0/1 value for a property of changed option
exports.getChangedOptionPropertyAsNumber = function(trial, prop){
   if (!trial.changedOptions)
      return 0;

   return helpers.getMostInformativeChangedOption(trial)[prop]? 1 : 0;
}


// get the number of trials, and print an error if some participants don't have the same number of trials
exports.getNumTrials = function(participants) {
   var num = false;
   participants.forEach(function(participant) {
      // initialize
      if (!num)
         num = participant.trials.length;
      // check if other participants have the same number of trials
      else if (num != participant.trials.length)
         console.log("Error! Participant " + participant.id + " has completed " + participant.trials.length + " trials instead of " + num);
   });
   return num;
}

exports.getNumTimeouts = function(participant) {
   return participant.trials.filter(function(trial) {
      return trial.timeout;
   }).length;
}

exports.getNumSuccesses = function(participant) {
   return participant.trials.filter(function(trial) {
      return trial.success;
   }).length;
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

// computes the sample standard deviation of an array of values
Math.ssd = function(values) {
   var mean = Math.average(values);
   var variance = values.reduce(function(previousValue, currentValue) {
      return previousValue + (currentValue - mean) * (currentValue - mean);
   }, 0);
   return Math.sqrt(variance / (values.length - 1));
}

// computes the standard error of the mean of an array of values
Math.sem = function(values) {
   //console.log(values.length)
   return Math.ssd(values) / Math.sqrt(values.length);
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

exports.convertBatch112Data = function() {
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

exports.preprocessData = function() {

   // creates a convenient enumerating (but non-enumerable!) function
   Object.defineProperty(wunderlist.tabs, "forEachNonBloat", {
      value: function(callback) {
         this.forEach(function(tab) {
            if (!tab.bloat)
               callback(tab);
         })
      }
   })

   // replace tab.option_ids by pointers to actual options
   wunderlist.tabs.forEachNonBloat(function(tab) {
      var tabOptions = tab.options.map(function(option_id) {
         return wunderlist.options[option_id];
      })
      tab.options = tabOptions;
   })

   // add pointer to tab (and index in that tab) to options
   wunderlist.tabs.forEachNonBloat(function(tab) {
      for (var i = 0; i < tab.options.length; i++) {
         tab.options[i].tab = tab;
         // the display code only uses filteredIndex (not the real .index), but this could be useful in the analysis
         tab.options[i].index = i;
      }
   })

   // add tab index information for future sorting
   for (var i = 0, len = wunderlist.tabs.length; i < len; i++) {
      wunderlist.tabs[i].index = i;
   }


   // put trials in an array, instead of using unique identifiers as in Firebase
   // NB we can't do this for the tutorial, since the same step might have been repeated multiple times
   input.forEach(function(worker) {
      if (!worker.trials)
         return;

      // check that there are no unexpected keys/trials
      var index = 0;
      Object.keys(worker.trials).sort().forEach(function(key) {
         if (worker.trials[key].number !== index)
            console.log("Error! trial " + worker.trials[key].number + " of worker " + worker.id + " is not equal to " + index)
         index++;
      });

      // map trials to an array index from 0 to n-1
      worker.trials = Object.keys(worker.trials).map(function(key) {
         return worker.trials[key];
      });
   });

   // there was one case of a negative (??) short duration
   helpers.validParticipants().forEach(function(participant) {
      participant.trials.forEach(function(trial) {
         if (trial.duration.short < 0) {
            console.log("Error! trial " + trial.number + " of participant " + participant.id + " has shortDuration=" + trial.duration.short + ", corrected to longDuration=" + trial.duration.long)
            trial.duration.short = trial.duration.long;
         }
      });
   });

   // reverse search score to have visual search positive / text-based search negative
   helpers.validParticipants().forEach(function(participant){
      if(participant.condition.interface>0){

         // weird behavior: parsing "0" to integer causes it to be unrecognized (null) in the csv...
         if(participant.questionnaires.preference.search != 0){            
            participant.questionnaires.preference.search = parseInt(participant.questionnaires.preference.search);
            participant.questionnaires.preference.search= -participant.questionnaires.preference.search;
         }
      }
   });
}

exports.checkData = function() {

   // check if correctHookHasBeenSelected is logged as expected
   helpers.validParticipants().forEach(function(participant) {
      if (participant.condition.interface === 0)
         return;

      participant.trials.forEach(function(trial) {
         var correctHookSelector = exports.getSelector(trial.targetOption);
         var correctHookHasBeenSelected = false;

         // check if this selector appears in the list of clicked hooks
         if (trial.selectedHooks) {
            trial.selectedHooks.forEach(function(hook) {

               if (hook.options_IDs.indexOf(trial.targetOption) >= 0)
                  correctHookHasBeenSelected = true;
            });
         }

         // we eliminate the special case of pax
         if (participant.id == "pax")
            return;

         if (correctHookHasBeenSelected !== trial.correctHookHasBeenSelected)
            console.log("Error! correctHookHasBeenSelected is inconsistent in trial " + trial.number + " of participant " + participant.id, correctHookHasBeenSelected, trial.correctHookHasBeenSelected, trial.targetOption)
      });
   });
}
