/* Load dependencies and call other scripts to generate all outputs based on original json file */
/* Each parsing script must expose a filename and an output array */

// parameters
batch = "2-24";
var inputFolder = batch + "/mturk/";
var inputFilepath = inputFolder + batch + ".json";
basePayment = 2;
bonusPerTrial = 0.05;
bonusPerTab = 0.03;
bonusPerOption = 0.03;
totalNumTrials = 41;
addPax = false;

// 0: no problems, 1: participant experienced minor bugs, 2: participant experienced major bugs / number of errors
problems = {
   "mh6oa5uk": 1,
   "zjkgjapb": 2,
   "48oqor59": 2,
   "ziyzp70i": 0,
   "bw6ge9qu": 2,
   "y2flppmw": 1,
   "u9tfna64": 0,
   "e3idjgam": 2,
   "fsk2fgmq": 1,
   "h4hgn25j": 0,
   "phjh26hc": 1,
   "kkve0dki": 2,
   "295gadhc": 0,
   "k5a0l1ni": 1,
   "d2pbqq80": 0,
   "zdrsiddl": 0,
   "sgcg1k70": 0,
   "ot5jw5nw": 0,
   "vr8ln53q": 0,
   "ymkonwth": 2,
   "cvmxtfbn": 0,
   "mppakz7p": 0,
   "9wl1dod1": 0,
   "0vshpky4": 0
}

/* helper functions and dependencies */

fs = require("fs");
helpers = require("./helpers.js");
wunderlist = {
   "options": JSON.parse(fs.readFileSync(inputFolder + "options_wunderlist.json", 'utf8')),
   "tabs": JSON.parse(fs.readFileSync(inputFolder + "tabs_wunderlist.json", 'utf8')),
   "mappings": JSON.parse(fs.readFileSync(inputFolder + "mappings_wunderlist.json", 'utf8'))
}


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
helpers.preprocessData();

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
