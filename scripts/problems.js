/* write a list of problems experienced by workers */

exports.output = [];

var count = 0;
var workersWithProblem = {};
input.forEach(function(worker) {

   if (worker.questionnaires && worker.questionnaires.problemFeedback) {
      exports.output.push({
         // general information about this worker
         "id": worker.id,
         "timestamp": worker.info.timestamp,
         "worker_id": worker.info.worker_id,
         "assignment_id": worker.info.assignment_id,
         "interface": worker.condition.interface,
         "defaults": worker.condition.oppositeDefaults ? "opposite" : "",

         "problemFeedback": helpers.formatStringForCSV(worker.questionnaires.problemFeedback)
      })
      count++;
      workersWithProblem[worker.info.worker_id] = (workersWithProblem[worker.info.worker_id] ? workersWithProblem[worker.info.worker_id]++ : 1);
   }
})

helpers.sortChronologically(exports.output)

console.log(Object.keys(workersWithProblem).length + " workers experienced a problem (" + count + " total)");
console.log();
