/* helper functions for enumerating the data and writing csv files */

// add a convenient enumaration method to all objects
Object.defineProperty(Object.prototype, "forEach", {
   value: function(callback) {
      Object.keys(this).forEach(function(key) {
         callback(this[key]);
      }, this)
   }
})

// standardized filename and location for all parsing scripts
exports.filename = function(name) {
   return batch + "/" + name + "-" + batch + ".csv";
}

// write an entire csv file at once, from a 2D array of data
exports.writeCsvFile = function(filename, data) {

   var csv = data.map(function(line) {
      return line.join(",");
   })

   csv = csv.join("\n");


   fs.writeFile(filename, csv, function(err) {
      if (err) {
         return console.log(err);
      }
      console.log("output written in: ", filename);
   })

}
