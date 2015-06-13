/* write summary of all the workers in this batch */

// generate filename
exports.filename = helpers.filename("workers");

// parse data
exports.output = [];
input.forEach(function(worker) {

   exports.output.push({
      // general information about this worker
      "id": worker.id,
      "timestamp": worker.info.timestamp,
      "worker_id": worker.info.worker_id,
      "assignmentId": worker.info.assignment_id,
      "OS": worker.info.apparatus ? worker.info.apparatus.os : "",
      "browser": worker.info.apparatus ? worker.info.apparatus.browser : "",
      "defaults": worker.condition.oppositeDefaults ? "opposite" : "",
      "interface": worker.condition.interface,

      // latest instructions page reached
      "instructions": worker.instructions ? getLastInstructionsPage(worker) : "",

      // # of tutorial steps completed, if any
      "tutorial": worker.tutorial ? Object.keys(worker.tutorial).length : "",

      // # of experiment trials completed, if any
      "trials": worker.trials ? Object.keys(worker.trials).length : "",

      // "recognition", "preference", "all"
      "questionnaires": latestQuestionnaireCompletedBy(worker),

      // "duplicate" if worker participated more than once
      "duplicate": helpers.isDuplicate(worker) ? "duplicate" : "",

      // "bad" if worker completed the experiment more than once
      "bad": helpers.isBadDuplicate(worker) ? "bad" : "",

      // "complete" if the entire experiment was completed
      "complete": helpers.isComplete(worker) ? "complete" : "",

      // "valid" if worker completed the experiment, but did not attempt to complete it multiple times
      "valid": helpers.isValid(worker) ? "valid" : "",

      // time it took participants to reach the final page, in minutes
      "duration": worker.instructions ? getTotalDuration(worker) : "",

      // bonus for that worker, if any
      "payment": getPayment(worker)
   })

   // assuming participants couldn't complete questionnaires not in the right order: recognition, preference, demographics
   function latestQuestionnaireCompletedBy(worker) {
      if (!worker.questionnaires)
         return "";
      if (worker.questionnaires.demographics)
         return "all";
      if (worker.questionnaires.preference)
         return "preference";
      if (worker.questionnaires.recognition)
         return "recognition";
   }

   function getPayment(worker) {
      if (!helpers.isComplete(worker))
         return "";

      return basePayment + getBonus(worker);
   }

   function getBonus(worker) {
      var bonus = 0

      bonus += bonusPerTrial * Object.keys(worker.trials.filter(function(trial) {
         return trial.success;
      })).length;

      bonus += Math.max(0, (2 * worker.questionnaires.recognition.tabs.score - 10) * bonusPerTab);
      bonus += Math.max(0, (2 * worker.questionnaires.recognition.options.score - 20) * bonusPerOption);

      return bonus;
   }

   function getLastInstructionsPage(worker) {
      var max = 0;
      worker.instructions.forEach(function(page) {
         max = Math.max(max, page.page)
      });
      return max;
   }

   function getTotalDuration(worker) {
      var duration = 0;
      worker.instructions.forEach(function(page) {
         duration += page.duration;
      });
      return duration / 60;
   }
});

// sort chronologically
exports.output.sort(function(workerA, workerB) {
   return workerA.timestamp - workerB.timestamp;
})

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
