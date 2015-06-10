/* write summary of all the workers in this batch */
exports.filename = helpers.filename("workers");

exports.output = [
   ["workerId"]
];

input.forEach(function(worker) {
   exports.output.push([worker.info.worker_id]);
});
