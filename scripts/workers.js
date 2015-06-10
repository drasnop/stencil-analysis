/* write summary of all the workers in this batch */

// generate filename
exports.filename = helpers.filename("workers");

// define headers
exports.output = [
   ["workerId", "assignmentId", "defaults", "interface", "tutorial", "trials", "questionnaires", "duplicate", "complete", "valid"]
];

// parse data
input.forEach(function(worker) {

   // # of tutorial steps completed, if any
   var tutorial = worker.tutorial ? Object.keys(worker.tutorial).length : "";

   // # of experiment trials completed, if any
   var trials = worker.trials ? Object.keys(worker.trials).length : "";

   // "recognition", "preference", "all"
   var questionnaires = "";
   if (worker.questionnaires) {
      if (worker.questionnaires.recognition)
         questionnaires = "recognition";
      if (worker.questionnaires.preference)
         questionnaires = "preference";
      if (worker.questionnaires.demographics)
         questionnaires = "all";
   }

   // "duplicate" if worker participated more than once
   var duplicate = helpers.isDuplicate(worker) ? "duplicate" : "";

   // "complete" if the entire experiment was completed
   var complete = helpers.isComplete(worker) ? "complete" : "";

   // "valid" if worker completed the experiment, but did not atempt to complete it multiple times
   var valid = helpers.isValid(worker) ? "valid" : "";

   exports.output.push([worker.info.worker_id, worker.info.assignment_id, worker.condition.oppositeDefaults ? "opposite" : "", worker.condition.interface,
      tutorial, trials, questionnaires, duplicate, complete, valid
   ]);
});

// print some summary statistics to the console
console.log()
console.log(Object.keys(input).length + " workers processed");
console.log(Object.keys(helpers.duplicateParticipants()).length + " duplicate workers");
console.log(Object.keys(helpers.uniqueDuplicateParticipants()).length + " unique duplicate participants");
console.log(Object.keys(helpers.badDuplicateParticipants()).length + " bad duplicate participants");
console.log(Object.keys(helpers.startedTutorialButNotCompleteParticipants()).length + " workers started tutorial but did not complete experiment");
console.log(Object.keys(helpers.completeParticipants()).length + " complete participants");
console.log(Object.keys(helpers.validParticipants()).length + " valid participants");
console.log()
