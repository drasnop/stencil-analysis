/* Load dependencies and call other scripts to generate all outputs based on original json file */
/* Each parsing script must expose a filename and an output array */

// parameters
batch = "1-20-pax";
var inputFilepath = "mturk/1-20.json"
basePayment = 1;
bonusPerTrial = 0.15;
bonusPerTab = 0.03;
bonusPerOption = 0.03;

/* helper functions and dependencies */

fs = require("fs");
helpers = require("./helpers.js");
mappings = JSON.parse(fs.readFileSync("mturk/mappings_wunderlist.json", 'utf8'));


/* input */

// read input data
input = JSON.parse(fs.readFileSync(inputFilepath, 'utf8'));
console.log("Input file parsed: ", inputFilepath)

// add pax's data, to have an even number of participants
input["pax"] = JSON.parse(fs.readFileSync("pilots/pax-pilot-reformatted.json", "utf8")).pax;

// add additional info to the first batch, if needed
helpers.convertBatch112Data();

// make some changes to the mturk json data to facilitate further processing
helpers.betterFormatData();


/* output */

var workers = require("./workers.js");
helpers.writeJSONtoCSVfile(workers.filename, workers.output)

var bonuses = require("./bonuses.js");
helpers.writeJSONtoCSVfile(bonuses.filename, bonuses.output)

var questionnairesParticipants = require("./questionnaires-participants.js");
helpers.writeJSONtoCSVfile(questionnairesParticipants.filename, questionnairesParticipants.output)

var trials = require("./trials.js");
helpers.writeJSONtoCSVfile(trials.filename, trials.output)

var aggregate = require("./aggregate.js");
helpers.writeJSONtoCSVfile(aggregate.filename, aggregate.output)
