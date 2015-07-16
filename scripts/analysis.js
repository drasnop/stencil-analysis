/* Load dependencies and call other scripts to generate all outputs based on original json file */
/* Each parsing script must expose a filename and an output array */

// parameters
batch = "1-20-pax";
var inputFilepath = "mturk/1-20.json"
basePayment = 2;
bonusPerTrial = 0.05;
bonusPerTab = 0.03;
bonusPerOption = 0.03;
addPax = true;

/* helper functions and dependencies */

fs = require("fs");
helpers = require("./helpers.js");
mappings = JSON.parse(fs.readFileSync("mturk/mappings_wunderlist.json", 'utf8'));


/* input */

// read input data
input = JSON.parse(fs.readFileSync(inputFilepath, 'utf8'));
console.log("Input file parsed: ", inputFilepath)

// add pax's data, to have an even number of participants
if (addPax) {
   var paxPilotDataPath = "pilots/pax-pilot-reformatted.json";
   input["pax"] = JSON.parse(fs.readFileSync(paxPilotDataPath, "utf8")).pax;
   console.log("Pax data added from ", paxPilotDataPath)
}

// add additional info to the first batch, if needed
helpers.convertBatch112Data();

// make some changes to the mturk json data to facilitate further processing
helpers.betterFormatData();

// run some tests to ensure my data collection works as expected
helpers.checkData();


/* output */

var workers = require("./workers.js");
helpers.writeJSONtoCSVfile(workers.filename, workers.output)

var bonuses = require("./bonuses.js");
helpers.writeJSONtoCSVfile(bonuses.filename, bonuses.output)

var questionnairesParticipants = require("./questionnaires-participants.js");
helpers.writeJSONtoCSVfile(questionnairesParticipants.filename, questionnairesParticipants.output)

var trials = require("./trials.js");
helpers.writeJSONtoCSVfile(trials.filename, trials.output)

var tutorial = require("./tutorial.js");
helpers.writeJSONtoCSVfile(tutorial.filename, tutorial.output)

var aggregate = require("./aggregate.js");
helpers.writeJSONtoCSVfile(aggregate.filename, aggregate.output)

var standardErrors = require("./standard-errors.js");
helpers.writeJSONtoCSVfile(standardErrors.filename, standardErrors.output)

var standardError = require("./standard-error.js");
helpers.writeJSONtoCSVfile(standardError.filename, standardError.output)
