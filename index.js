

/*
 * Authorizes and makes a request to the Instagram API.
 */


function main() {
   var Airtable = require('airtable');
   var base = new Airtable({ apiKey: 'keyavbuTLcnhJBwKt' }).base('appk3kBRjuom1ivqW');
   base('days').create({
      "date": "2016-10-23",
      "media": 507,
      "follows": 1032,
      "followed_by": 6912
      }, function(err, record) {
            if (err) { console.log(err); return; }
            console.log(record);
         });     
}

function IG_getCounts() {
   var ACCESS_TOKEN = '1347857108.058707f.f8701d6afb4941c498e977bba6fef51e';
   var url = 'https://api.instagram.com/v1/users/self/?access_token=' + ACCESS_TOKEN;
   var response = UrlFetchApp.fetch(url);         
   var result = JSON.parse(response.getContentText());
 //  return result.data.counts;
}