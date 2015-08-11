/* write data for each trial of each valid participant in this batch */

// 0 = not in tutorial, 0.5 = not really, but could be inferred, 0.8 = very similar to one in tutorial, 1 = explicitly in tutorial
hookInTutorial = {
   "language": 0,
   "date_format": 0.5,
   "time_format": 0.5,
   "start_of_week": 0.5,
   "sound_checkoff_enabled": 1,
   "sound_notification_enabled": 1,
   "new_task_location": 1,
   "confirm_delete_entity": 1,
   "behavior_star_tasks_to_top": 1,
   "print_completed_items": 1,
   "show_subtask_progress": 0,
   "shortcut_add_new_task": 1,
   "shortcut_add_new_list": 1,
   "shortcut_mark_task_done": 1,
   "shortcut_mark_task_starred": 1,
   "shortcut_select_all_tasks": 0,
   "shortcut_delete": 1,
   "shortcut_copy_tasks": 0,
   "shortcut_paste_tasks": 0,
   "shortcut_goto_search": 1,
   "shortcut_goto_preferences": 1,
   "shortcut_send_via_email": 0,
   "shortcut_show_notifications": 1,
   "shortcut_goto_inbox": 1,
   "shortcut_goto_filter_assigned": 0.8,
   "shortcut_goto_filter_starred": 1,
   "shortcut_goto_filter_today": 0.8,
   "shortcut_goto_filter_week": 0.8,
   "shortcut_goto_filter_all": 0.8,
   "shortcut_goto_filter_completed": 0.8,
   "shortcut_sync": 0.5,
   "smartlist_visibility_assigned_to_me": 0.8,
   "smartlist_visibility_starred": 1,
   "smartlist_visibility_today": 0.8,
   "smartlist_visibility_week": 0.8,
   "smartlist_visibility_all": 0.8,
   "smartlist_visibility_done": 0.8,
   "today_smart_list_visible_tasks": 0,
   "notifications_email_enabled": 1,
   "notifications_push_enabled": 1,
   "notifications_desktop_enabled": 1,
}

exports.output = [];
helpers.validParticipants().forEach(function(participant) {

   participant.trials.forEach(function(trial) {

      exports.output.push({

         /* general information about this participant */

         "id": participant.id,
         "problems": problems[participant.id],
         "defaults": participant.condition.oppositeDefaults ? "opposite" : "",
         "interface": participant.condition.interface,
         "interfaceType": participant.condition.interface > 0 ? "customizationMode" : "control",

         /* info about this trial */

         "block": helpers.getBlock(trial),
         "trialNumber": trial.number,
         "targetOption": trial.target.option,
         "targetTab": wunderlist.options[trial.target.option].tab.name,
         "targetIndex": wunderlist.options[trial.target.option].index,
         "targetHideable": trial.target.hideable ? 1 : 0,
         "targetGhost": trial.target.ghost && participant.condition.interface > 0 ? 1 : 0,
         "targetShowMore": wunderlist.options[trial.target.option].more ? 1 : 0,
         "hookInTutorial": hookInTutorial[trial.target.option],

         "numVisitedTabs": trial.visitedTabs ? trial.visitedTabs.length : 0,
         "numChangedOptions": trial.changedOptions ? trial.changedOptions.length : 0,
         "correctHookHasBeenSelected": trial.correctHookHasBeenSelected ? 1 : 0,
         "numPanelExpanded": numPanelExpanded(trial),
         "panelWasExpanded": helpers.getChangedOptionPropertyAsNumber(trial, "panelExpanded"),
         "numClusterExpanded": numClusterExpanded(trial),
         "clusterWasExpanded": clusterWasExpanded(trial),
         "numShowMore": trial.showMoreOptions ? trial.showMoreOptions.length : 0,

         "numSelectedHooks": trial.selectedHooks ? trial.selectedHooks.length : 0,
         "numUniqueHooksSelected": numUniqueHooksSelected(trial),
         "numSameHooksSelected": numSameHooksSelected(participant, trial),
         "numTotalUniqueHooksSelected": numTotalUniqueHooksSelected(participant, trial),
         "numTrueTotalUniqueHooksSelected": numTrueTotalUniqueHooksSelected(participant, trial),

         /* outcome */

         "success": trial.success ? 1 : 0,
         "timeout": trial.timeout ? 1 : 0,
         "changedOption": trial.changedOptions ? helpers.getMostInformativeChangedOption(trial).option_ID : "",
         "changedValue": trial.changedOptions ? helpers.getMostInformativeChangedOption(trial).newValue : "",
         "targetValue": trial.target.value,

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


/* Panel */

function numPanelExpanded(trial) {
   if (!trial.panel)
      return 0;

   return trial.panel.filter(function(event) {
      return event.action == "expanded";
   }).length;
}

/* Clusters */

function numClusterExpanded(trial) {
   if (!trial.cluster)
      return 0;

   return trial.cluster.filter(function(event) {
      return event.action == "expanded";
   }).length;
}

function clusterWasExpanded(trial) {
   if (!trial.changedOptions)
      return "";

   var option = helpers.getMostInformativeChangedOption(trial);

   if (!option.clusterExpanded)
      return "";

   return option.clusterExpanded ? 1 : 0;
}

/* Hooks */

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
