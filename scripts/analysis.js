/* Load dependencies and call other scripts to generate all outputs based on original json file */
/* Each parsing script must expose a filename and an output array */

// parameters
batch = "1-20";
var inputFilepath = "mturk/" + batch + ".json"
basePayment = 1;
bonusPerTrial = 0.15;
bonusPerTab = 0.03;
bonusPerOption = 0.03;

// load helper functions and dependencies
fs = require("fs");
helpers = require("./helpers.js");

// read input data
input = JSON.parse(fs.readFileSync(inputFilepath, 'utf8'));
console.log("Results file parsed: ", inputFilepath)

// add additional info to the first batch, if needed
helpers.convertOldPilotData();

// write summary of all the workers in this batch
var workers = require("./workers.js");
helpers.writeJSONtoCSVfile(workers.filename, workers.output)

var questionnairesParticipants = require("./questionnaires-participants.js");
helpers.writeJSONtoCSVfile(questionnairesParticipants.filename, questionnairesParticipants.output)

var trials = require("./trials.js");
helpers.writeJSONtoCSVfile(trials.filename, trials.output)

var durationsParticipants = require("./durations-participants.js");
helpers.writeJSONtoCSVfile(durationsParticipants.filename, durationsParticipants.output)
