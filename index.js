

/*
 * Authorizes and makes a request to the Instagram API.
 */

var Airtable = require('airtable');
var base = new Airtable({ apiKey: 'keyavbuTLcnhJBwKt' }).base('appk3kBRjuom1ivqW');

//result = IG_getCounts();

var igData = IG_getCounts();

base('days').create( igData, function(err, record) {
    if (err) { console.log(err); return; }
    console.log(record);
}); 	

function IG_getCounts() {
   var ACCESS_TOKEN = '1347857108.058707f.f8701d6afb4941c498e977bba6fef51e';
   Instagram = require('instagram-node-lib');
   //Instagram.set('ACCESS_TOKEN', ACCESS_TOKEN)
   var data = Instagram.users.self( {
   	access_token: '1347857108.058707f.f8701d6afb4941c498e977bba6fef51e',
	   complete: function(data){
	       console.log(data);
	     }
	   });
   return data   
}
   //var url = 'https://api.instagram.com/v1/users/self/?access_token=' + ACCESS_TOKEN;
   //var response = UrlFetchApp.fetch(url);         
   
   
   
  // var result = JSON.parse(response.getContentText());
   //return result.data.counts;

