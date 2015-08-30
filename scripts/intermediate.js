/* write data from the questionnaires of the within-subjects participants */

exports.output = [];
helpers.validParticipants().forEach(function(participant) {

   var data = {

      "id": participant.id,
      "interface": participant.condition.interface,

      /* demographics */

      "gender": participant.questionnaires.demographics.gender,
      "age": helpers.getAge(participant),
      "computerUse": participant.questionnaires.demographics.computerUse,
      "wunderlistUse": participant.questionnaires.demographics.wunderlistUse,
   }

   /* intermediate questionnaires */

   for (var i = 0; i <= 3; i++) {
      data["easeOfUse" + i] = participant.questionnaires.intermediate[i].easeOfUse;
      data["speed" + i] = participant.questionnaires.intermediate[i].speed;
      data["liking" + i] = participant.questionnaires.intermediate[i].liking;
   }

   exports.output.push(data);
});


helpers.sortByParticipantID(exports.output)
