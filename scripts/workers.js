/* write summary of all the workers in this batch */

// generate filename
exports.filename = helpers.filename("workers");

// define headers
exports.output = [
   ["workerId", "assignmentId", "defaults", "interface", "tutorial", "trials", "questionnaires", "valid", "duplicate"]
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

   // "valid" if the entire experiment was completed
   var valid = helpers.validParticipants().indexOf(worker) > 0 ? "valid" : "";

   // "duplicate" if worker participated more than once
   var duplicate = helpers.duplicateParticipants().indexOf(worker) > 0 ? "duplicate" : "";

   exports.output.push([worker.info.worker_id, worker.info.assignment_id, worker.condition.oppositeDefaults ? "opposite" : "", worker.condition.interface,
      tutorial, trials, questionnaires, valid, duplicate
   ]);
});
