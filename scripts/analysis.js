/* Load dependencies and call other scripts to generate all outputs based on original json file */
/* Each parsing script must expose a filename and an output array */

// parameters
batch = "0-12";
var inputFilepath = "mturk/" + batch + ".json"

// load helper functions and dependencies
fs = require("fs");
helpers = require("./helpers.js");

// read input data
input = JSON.parse(fs.readFileSync(inputFilepath, 'utf8'));
console.log("Results file parsed: ", inputFilepath)


// write summary of all the workers in this batch
var workers = require("./workers.js");
helpers.writeJSONtoCSVfile(workers.filename, workers.output)

var questionnairesParticipants = require("./questionnaires-participants.js");
helpers.writeJSONtoCSVfile(questionnairesParticipants.filename, questionnairesParticipants.output)

var trials = require("./trials.js");
helpers.writeJSONtoCSVfile(trials.filename, trials.output)
