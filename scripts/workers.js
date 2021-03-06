/* write summary of all the workers in this batch */

exports.output = [];
input.forEach(function(worker) {

   exports.output.push({
      // general information about this worker
      "id": worker.id,
      "timestamp": worker.info.timestamp,
      "worker_id": worker.info.worker_id,
      "assignment_id": worker.info.assignment_id,
      "OS": worker.info.apparatus ? worker.info.apparatus.os : "",
      "browser": worker.info.apparatus ? worker.info.apparatus.browser : "",
      "defaults": worker.condition.oppositeDefaults ? "opposite" : "",
      "interface": worker.condition.interface,

      // latest instructions page reached
      "instructions": worker.instructions ? getLastInstructionsPage(worker) : "",

      // # of tutorial steps completed, if any
      "tutorial": worker.tutorial ? Object.keys(worker.tutorial).length : "",

      // # of experiment trials completed, if any
      "trials": worker.trials ? worker.trials.length : "",

      // id of the option that worker did not complete
      "nextOption": worker.trials && !helpers.isComplete(worker) ? worker.sequences.optionsSequence[worker.trials.length] : "",

      // "recognition", "preference", "all"
      "questionnaires": latestQuestionnaireCompletedBy(worker),


      // if workers reported a problem settting up the experiment software
      "setupProblem": worker.questionnaires && worker.questionnaires.problemFeedback ? 1 : 0,

      // "duplicate" if worker participated more than once
      "duplicate": helpers.isDuplicate(worker) ? "duplicate" : "",

      // "bad" if worker completed the experiment more than once
      "bad": helpers.isBadDuplicate(worker) ? "bad" : "",

      // "complete" if the entire experiment was completed
      "complete": helpers.isComplete(worker) ? "complete" : "",

      // "valid" if worker completed the experiment, but did not attempt to complete it multiple times
      "valid": helpers.isValid(worker) ? "valid" : "",


      // time it took participants to complete all steps of the tutorial
      "tutorialDuration": worker.tutorial ? helpers.getTutorialDuration(worker) : "",

      // time it took participants to complete all the trials of the experiment
      "trialsDuration": worker.trials ? helpers.getTrialsDuration(worker) : "",

      // time it took participants to reach the final page, in minutes
      "totalDuration": worker.instructions ? helpers.getTotalDuration(worker) : "",

      // base rate + bonus for that worker, if any
      "payment": helpers.isComplete(worker) ? helpers.getPayment(worker) : ""
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

   function getLastInstructionsPage(worker) {
      return Math.max.apply(null, worker.instructions.map(function(page) {
         return page.page;
      }));
   }
});

helpers.sortChronologically(exports.output)

var startedExperiment = helpers.startedExperimentButNotCompleteWorkers();
var numTrials = startedExperiment.map(function(worker) {
   return worker.trials.length;
})

// print some summary statistics to the console
console.log();
console.log(Object.keys(input).length + " workers processed");
console.log(Object.keys(helpers.duplicateWorkers()).length + " duplicate workers");
console.log(Object.keys(helpers.uniqueDuplicateWorkers()).length + " unique duplicate workers");
console.log(Object.keys(helpers.badDuplicateWorkers()).length + " bad duplicate workers");
console.log(Object.keys(helpers.badDuplicateAndCompleteWorkers()).length + " bad duplicate workers who may have submitted HIT");

console.log();
console.log(Object.keys(helpers.startedTutorialButNotCompleteWorkers()).length + " workers started tutorial but did not complete experiment");
console.log(Object.keys(startedExperiment).length + " workers started experiment but did not complete it (" + numTrials.join(", ") + ")");
console.log(Object.keys(helpers.completeParticipants()).length + " complete participants");
console.log(Object.keys(helpers.validParticipants()).length + " valid participants");
console.log();
