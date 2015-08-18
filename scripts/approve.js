/* Load all results.csv files from MTurk, and check that there are no duplicate workers */

var batches = ["1-20", "2-24", "3-24", "rect-15", "4-12", "rect-2"];
var filenames = batches.map(function(batch) {
   return "mturk_results_for_approval/Batch_" + batch + "_results.csv";
})

var csv = require("./node-csv.js");
fs = require("fs");
var helpers = require("./helpers.js");

var workerIDs = [];
var id;
var problem = false;

function checkBatch(index) {

   var filename = filenames[index];

   csv.each(filename, {
      headers: true
   }).on('data', function(data) {
      id = data["WorkerId"];
      if (typeof id != "undefined") {
         if (workerIDs.indexOf(id) >= 0) {
            console.log(id + "\tproblem!")
            problem = true;
         } else
            console.log(id + "\tseen for the first time")
         workerIDs.push(id);
      }
   }).on('end', function() {
      console.log(filename + ' parsed');
      console.log(problem ? "Problem!" : "All good")
      console.log()

      if (index + 1 < batches.length)
         checkBatch(index + 1)
      else {
         var ids = workerIDs.join("\n");
         helpers.writeFile("approve.log", ids)
      }
   })
}

checkBatch(0)
