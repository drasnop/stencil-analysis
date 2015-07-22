/* write data for each step of the the tutorial, for each valid participant in this batch */

exports.output = [];
helpers.validParticipants().forEach(function(participant) {

   participant.tutorial.forEach(function(step) {

      exports.output.push({

         /* general information about this participant */

         "id": participant.id,
         "defaults": participant.condition.oppositeDefaults ? "opposite" : "",
         "interface": participant.condition.interface,
         "interfaceType": participant.condition.interface > 0 ? "customizationMode" : "control",

         /* info about this step */

         "step": step.step,
         "duration": step.duration
      })
   });
});



// sort by condition then participant then step number, to make it easier to read
exports.output.sort(function(workerDataA, workerDataB) {

   if (workerDataA.interface == workerDataB.interface) {
      if (workerDataA.id == workerDataB.id) {
         return workerDataA.step - workerDataB.step;
      }
      return helpers.compareAlphaNum(workerDataA.id, workerDataB.id);
   }
   return workerDataA.interface - workerDataB.interface;
})
