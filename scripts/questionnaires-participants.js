/* write data from all 3 questionnaires for the valid participants in this batch */

// generate filename
exports.filename = helpers.filename("questionnaires-participants");

// parse data
exports.output = [];
helpers.validParticipants().forEach(function(participant) {

   exports.output.push({

      "id": participant.id,

      /* demographics */

      "gender": participant.questionnaires.demographics.gender,
      "age": getAge(participant),
      "computerUse": participant.questionnaires.demographics.computerUse,
      "wunderlistUse": participant.questionnaires.demographics.wunderlistUse,

      /* general information about this participant */

      "defaults": participant.condition.oppositeDefaults ? "opposite" : "",
      "interface": participant.condition.interface,

      /* recognition */

      "tabsRecognitionScore": participant.questionnaires.recognition.tabs.score,
      "optionsRecognitionScore": participant.questionnaires.recognition.options.score,

      /* preference */

      "easeOfUse": participant.questionnaires.preference.easeOfUse,
      "liking": participant.questionnaires.preference.liking,
      "interfaceFeedback": helpers.formatStringForCSV(participant.questionnaires.preference.feedback),

      /* additional feedback */

      "generalFeedback": helpers.formatStringForCSV(participant.questionnaires.additionalFeedback),
      "feedbackLength": getTotalCharactersInFeedbacks(participant)

   })

   function getAge(participant) {
      if (participant.questionnaires.demographics.ageNA)
         return "N/A";
      return participant.questionnaires.demographics.age;
   }

   function getTotalCharactersInFeedbacks(participant) {
      var count = 0;
      if (participant.questionnaires.preference.feedback)
         count += participant.questionnaires.preference.feedback.length;
      if (participant.questionnaires.additionalFeedback)
         count += participant.questionnaires.additionalFeedback.length;
      return count;
   }
});

// sort by condition, to make it easier to read
exports.output.sort(function(workerDataA, workerDataB) {
   return workerDataA.interface - workerDataB.interface;
})
