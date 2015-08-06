/* write data from all 3 questionnaires for the valid participants in this batch */

exports.output = [];
helpers.validParticipants().forEach(function(participant) {

   exports.output.push({

      "id": participant.id,

      /* demographics */

      "gender": participant.questionnaires.demographics.gender,
      "age": helpers.getAge(participant),
      "computerUse": participant.questionnaires.demographics.computerUse,
      "wunderlistUse": participant.questionnaires.demographics.wunderlistUse,

      /* general information about this participant */

      "defaults": participant.condition.oppositeDefaults ? "opposite" : "",
      "interface": participant.condition.interface,
      "interfaceType": participant.condition.interface > 0 ? "customizationMode" : "control",

      /* additional information on how they performed in the experiment */

      "numTimeouts": helpers.getNumTimeouts(participant),
      "numSuccesses": helpers.getNumSuccesses(participant),
      "numErrors": totalNumTrials - helpers.getNumSuccesses(participant),

      /* recognition */

      "tabsRecognitionScore": participant.questionnaires.recognition.tabs.score,
      "optionsRecognitionScore": participant.questionnaires.recognition.options.score,
      "optionsRecognitionScoreSelected": computeScore(getSelectedOptions(participant)),
      "optionsRecognitionScoreAdjacent": computeScore(getAdjacentOptions(participant)),
      "optionsRecognitionScoreFake": computeScore(getFakeOptions(participant)),
      "numValidAdjacentOptions": getNumValidAdjacentOptions(participant),

      /* preference */

      "easeOfUse": participant.questionnaires.preference.easeOfUse,
      "liking": participant.questionnaires.preference.liking,
      "familiarity": participant.questionnaires.preference.familiarity ? participant.questionnaires.preference.familiarity : "",
      "search": participant.questionnaires.preference.search ? participant.questionnaires.preference.search : "",
      "interfaceFeedback": helpers.formatStringForCSV(participant.questionnaires.preference.feedback),

      /* additional feedback */

      "generalFeedback": helpers.formatStringForCSV(participant.questionnaires.additionalFeedback),
      "feedbackLength": getTotalCharactersInFeedbacks(participant)
   })

   function getTotalCharactersInFeedbacks(participant) {
      var count = 0;
      if (participant.questionnaires.preference.feedback)
         count += participant.questionnaires.preference.feedback.length;
      if (participant.questionnaires.additionalFeedback)
         count += participant.questionnaires.additionalFeedback.length;
      return count;
   }

   function getSelectedOptions(participant) {
      return participant.questionnaires.recognition.options.responses.filter(function(response) {
         return response.adjacentOption;
      });
   }

   function getAdjacentOptions(participant) {
      return participant.questionnaires.recognition.options.responses.filter(function(response) {
         return response.adjacent;
      });
   }

   function getFakeOptions(participant) {
      return participant.questionnaires.recognition.options.responses.filter(function(response) {
         return !response.present;
      });
   }

   function computeScore(responses) {
      if (responses.length !== 5 && responses.length !== 10)
         console.log("Error! In options recognition questionnaire, number of options is: " + responses.length)

      return responses.reduce(function(score, response) {
         return score + (response.correct ? 1 : 0);
      }, 0)
   }

   // Ideally it should return 5 out of 5. But of course it cannot succeed if the number of errors is huge.
   function getNumValidAdjacentOptions(participant) {
      return participant.questionnaires.recognition.options.responses.filter(function(response) {
         return response.adjacent && response.valid;
      }).length;
   }
});

// sort by condition, to make it easier to read
exports.output.sort(function(workerDataA, workerDataB) {
   return workerDataA.interface - workerDataB.interface;
})
