/* create a csv file with the bonus to give to each participant */

// generate filename
exports.filename = helpers.filename("bonuses");

// parse data
exports.output = [];
helpers.validParticipants().forEach(function(worker) {

   exports.output.push({
      // general information about this worker
      "assignment_id": worker.info.assignment_id,
      "worker_id": worker.info.worker_id,

      // bonus for that worker, if any
      "bonus": helpers.getBonus(worker)
   })
});
