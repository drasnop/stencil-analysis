/* write data for each trial of each valid participant in this batch */

// generate filename
exports.filename = helpers.filename("trials");

// parse data
exports.output = [];
helpers.validParticipants().forEach(function(participant) {

   participant.trials.forEach(function(trial) {

      exports.output.push({

         /* general information about this participant */

         "id": participant.id,
         "defaults": participant.condition.oppositeDefaults ? "opposite" : "",
         "interface": participant.condition.interface,
         "interfaceType": participant.condition.interface > 0 ? "customizationMode" : "control",

         /* info about this trial */

         "trialNumber": trial.number,
         "targetOption": trial.targetOption,
         "targetTab": participant.options[trial.targetOption].tab.name,
         "numVisitedTabs": trial.visitedTabs ? trial.visitedTabs.length : 0,
         "correctHookHasBeenSelected": trial.correctHookHasBeenSelected ? 1 : 0,
         "numPanelExpanded": numPanelExpanded(trial),
         "panelWasExpanded": panelWasExpanded(trial) ? 1 : 0,
         "numSelectedHooks": trial.selectedHooks ? trial.selectedHooks.length : 0,
         "numUniqueHooksSelected": numUniqueHooksSelected(trial),
         "numSameHooksSelected": numSameHooksSelected(participant, trial),
         "numTotalUniqueHooksSelected": numTotalUniqueHooksSelected(participant, trial),
         "numTrueTotalUniqueHooksSelected": numTrueTotalUniqueHooksSelected(participant, trial),

         /* outcome */

         "success": trial.success ? 1 : 0,
         "timeout": trial.timeout ? 1 : 0,

         /* durations */
         "instructionsDuration": trial.duration.instructions,
         "shortDuration": trial.duration.short,
         "logShortDuration": Math.log(1 + trial.duration.short),
         "longDuration": trial.duration.long,
         "selectionDuration": trial.duration.selection,
         "selectBetween": trial.duration.selectBetween
      })
   });
});


function numPanelExpanded(trial) {
   if (!trial.panel)
      return 0;

   return trial.panel.filter(function(event) {
      return event.action == "expanded";
   }).length;
}

function panelWasExpanded(trial) {
   if (!trial.changedOptions)
      return 0;

   if (trial.success) {
      for (var i in trial.changedOptions) {
         if (trial.changedOptions[i].correct && trial.changedOptions[i].firstTime)
            return trial.changedOptions[i].panelExpanded;
      }
   } else {
      return trial.changedOptions[trial.changedOptions.length - 1].panelExpanded;
   }
}

function numUniqueHooksSelected(trial) {
   if (!trial.selectedHooks)
      return 0;

   return helpers.unique(trial.selectedHooks.map(function(hook) {
      return hook.selector;
   })).length;
}

// % of hooks selected in this trial that were selected in the previous trial
// this number will be 1 when participants select the same hook over and over again
function numSameHooksSelected(participant, trial) {
   var previousTrial = helpers.getTrial(participant, trial.number - 1);

   if (trial.number === 0 || !previousTrial)
      return 0;

   if (!trial.selectedHooks || !previousTrial.selectedHooks)
      return 0;

   // compare hooks based on their (unique) selector string
   var prevSelectors = previousTrial.selectedHooks.map(function(hook) {
      return hook.selector;
   })

   // of course we must consider each hook only once
   var currSelectors = helpers.unique(trial.selectedHooks.map(function(hook) {
      return hook.selector;
   }));

   // find how many selected hooks from this trial appear in the previous trial
   var count = currSelectors.filter(function(selector) {
      return prevSelectors.indexOf(selector) >= 0;
   }).length;

   return count / currSelectors.length;
}


// computes how many unique hooks were clicked during this trial and all the ones before
function numTotalUniqueHooksSelected(participant, trial) {
   var counts = {};

   participant.trials.forEach(function(t) {
      if (t.number <= trial.number && t.selectedHooks) {
         t.selectedHooks.forEach(function(hook) {
            counts[hook.selector] = counts[hook.selector] ? counts[hook.selector] + 1 : 1;
         });
      }
   });

   return Object.keys(counts).length;
}

function numTrueTotalUniqueHooksSelected(participant, trial) {
   var counts = {};
   var selector;

   participant.trials.forEach(function(t) {
      if (t.number <= trial.number) {
         selector = helpers.getSelector(t.targetOption);
         if (selector)
            counts[selector] = counts[selector] ? counts[selector] + 1 : 1;
      }
   });

   return Object.keys(counts).length;
}


// sort by condition then participant then trialNumber, to make it easier to read
exports.output.sort(function(workerDataA, workerDataB) {

   if (workerDataA.interface == workerDataB.interface) {
      if (workerDataA.id == workerDataB.id) {
         return workerDataA.trialNumber - workerDataB.trialNumber;
      }
      return helpers.compareAlphaNum(workerDataA.id, workerDataB.id);
   }
   return workerDataA.interface - workerDataB.interface;
})
