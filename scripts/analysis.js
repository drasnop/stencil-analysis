/* Load dependencies and call other scripts to generate all outputs based on original json file */
/* Each parsing script must expose an output array */

if (process.argv.length < 3)
   return console.log("usage: node analysis.js batch-number");

var batch = process.argv[2];

// parameters
totalNumTutorial = 17;
totalNumTrials = 41;
numBlocks = 3;

basePayment = 2;
bonusPerTrial = 0.05;
bonusPerTab = 0.03;
bonusPerOption = 0.03;

// 0: no problems, 0.5: no reported problems but was redone do be sure, 0.9: duplicate participants,
// 1: participant experienced minor bugs, 2: participant experienced major bugs / number of errors
problems = {
   /* batch 2-24 */
   "48oqor59": 2,
   "bw6ge9qu": 2,
   "e3idjgam": 2,
   "fsk2fgmq": 1,
   "h4hgn25j": 0.5,
   "kkve0dki": 2,
   "mh6oa5uk": 1,
   "phjh26hc": 1,
   "u9tfna64": 0.5,
   "y2flppmw": 1,
   "ziyzp70i": 0.5,
   "zjkgjapb": 2,
   "k5a0l1ni": 1,
   "ymkonwth": 2,

   /* batch 4-12 */
   "esfq3ee6": 0.9,
   "l04et6xn": 0.9
}

// whether these valid participants were outliers (determined from boxplots on duration and number of errors)
outliers = ["xqpi3r9n", "bicjgan9", "yacy699g"]

// set flag for within-subjects analysis
if (batch == "lab")
   within = true;

// tentative to run all between-subjects analyses together
if (batch == "all") {
   ["2-24", "3-24", "rect-15", "4-12", "rect-2"].forEach(analyzeBatch)
} else
   analyzeBatch(batch);

function analyzeBatch(batch) {

   // files
   var inputFolder = batch + "/mturk/";
   var inputFilepath = inputFolder + batch + ".json";
   consoleOutputFilepath = batch + "/" + "info-" + batch + ".log";

   /* helper functions and dependencies */

   fs = require("fs");
   helpers = require("./helpers.js");
   wunderlist = {
      "options": JSON.parse(fs.readFileSync(inputFolder + "options_wunderlist.json", 'utf8')),
      "tabs": JSON.parse(fs.readFileSync(inputFolder + "tabs_wunderlist.json", 'utf8')),
      "mappings": JSON.parse(fs.readFileSync(inputFolder + "mappings_wunderlist.json", 'utf8'))
   }

   // rewire console.log to also print to a file
   helpers.saveConsoleOutputToFile();

   /* input */

   // read input data
   input = JSON.parse(fs.readFileSync(inputFilepath, 'utf8'));
   console.log("Input file parsed: ", inputFilepath)
   console.log()

   /* // add pax's data, to have an even number of participants
   var paxPilotDataPath = "pilots/pax-pilot-reformatted.json";
   input["pax"] = JSON.parse(fs.readFileSync(paxPilotDataPath, "utf8")).pax;
   console.log("Pax data added from ", paxPilotDataPath) */

   // add additional info to the first batch, if needed
   helpers.convertBatch112Data();

   // rectify some data structure of batch 2-24
   helpers.convertBatch224Data();

   // rectify some data structure of batch lab
   if (within)
      helpers.convertWithinSubjectsData();

   // make some changes to the mturk json data to facilitate further processing
   helpers.preprocessData(batch);

   // run some tests to ensure my data collection works as expected
   helpers.checkData();


   /* output */

   var scripts = ["workers", "problems", "participants", "trials", "tutorial"];
   if (!within)
      scripts.push("bonuses", "questionnaires", "aggregate", "standard-errors", "standard-error");

   scripts.forEach(function(script) {
      helpers.writeJSONtoCSVfile(helpers.filename(batch, script), require("./" + script + ".js").output);
   });

}
