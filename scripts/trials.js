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
         "interfaceType": participant.condition.interface > 0 ? "customizationMode" : "settingsPanel",

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

         /* outcome */

         "success": trial.success ? 1 : 0,
         "timeout": trial.timeout ? 1 : 0,

         /* durations */
         "instructionsDuration": trial.duration.instructions,
         "shortDuration": trial.duration.short,
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

   var uniqueHooks = {};
   trial.selectedHooks.forEach(function(hook) {
      uniqueHooks[hook.selector] = true;
   });
   return Object.keys(uniqueHooks).length;
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
