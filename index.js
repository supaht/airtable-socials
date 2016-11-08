/*
 * Authorizes and makes a request to the Instagram API.
 */

var Airtable = require('airtable')
var request = require('request')
var jsonfile = require('jsonfile')
var moment = require('moment')

var base = new Airtable({ apiKey: 'keyavbuTLcnhJBwKt' }).base('appk3kBRjuom1ivqW')

// var IG_CLIENT_ID = '058707f5f06749e6b08f6f04c9c30cf0'
// var IG_CLIENT_SECRET = 'e0df059f83bc464088cc70859ba5475e'
var IG_ACCESS_TOKEN = '1347857108.058707f.f8701d6afb4941c498e977bba6fef51e'
var igCountsUrl = 'https://api.instagram.com/v1/users/self/?access_token=' + IG_ACCESS_TOKEN
var igPostsUrl = 'https://api.instagram.com/v1/users/self/media/recent/?access_token=' + IG_ACCESS_TOKEN

var getItems = function (url, callback) {
  request({
    url: url,
    json: true,
    headers: {'User-Agent': 'request'}
  }, function (err, res, data) {
    if (err) {
      console.log('Error:', err)
    } else if (res.statusCode !== 200) {
      console.log('Status:', res.statusCode)
    } else {
        // data is already parsed as JSON:
      callback(null, data)
    }
  }
) }

function postToTable (table, data) {
  // console.log(data);
  base(table).create(data, function (err, record) {
    if (err) { console.log('Error: ', err); return }
    // console.log('Record: ',record.id);
    return record.id
  })
}

// Take a list of tags and posts new ones to the tags table.
// Returns a list of id for those records.
var postTags = function (table, data, callback) {
  var tagList = {}
  var recordIdList = []

  // First download a list of all tags to check if already present
  base('tags').select({
    view: 'Main View'
  }).eachPage(function page (records, fetchNextPage) {
    // This function (`page`) will get called for each page of records.
    records.forEach(function (record) {
      tagList[record.get('tag')] = record.id
       // console.log('Retrieved ', record.get('tag'));
    })

    // To fetch the next page of records, call `fetchNextPage`.
    // If there are more records, `page` will get called again.
    // If there are no more records, `done` will get called.
    fetchNextPage()
  }, function done (error) {
    if (error) {
      console.log('Error: ', error)
    } else {
         // console.log(tagList);

      // Iterate through tags and post new ones
      data.forEach(function (data) {
        // var json = {'tag': data}

        if (typeof tagList[data] === 'undefined') {
          base(table).create({'tag': data}, {typecast: true}, function (err, record) {
            if (err) { console.log('Error: ', err); return }
                  // console.log('Record: ',record.id);
            recordIdList.push(record.id)
                  // return record.id;
          })
        } else recordIdList.push(tagList[data])
      })
          // console.log(recordIdList);
      callback(recordIdList)
    }
  })
}

// Get the day's current counts and post them to a new row
getItems(igCountsUrl, function (err, items) {
  if (err) { console.log('Error: ', err); return }
  items.data.counts.date = moment().format('YYYY-MM-DD')
  postToTable('days', items.data.counts)
//     console.log(data.data.counts);
})

// Get the most recent media. Post new ones, update exisiting ones.
getItems(igPostsUrl, function (err, items) {
  if (err) { console.log('Error: ', err); return }
  var postData = {}

  // for(var i =0; i <items.data.length; i++){
  items.data.forEach(function (data) {
    postData.media_id = getIgShortCode(data.link)
    postData.type = data.type
    postData.created_time = moment.unix(data.created_time).toISOString()
    postData.link = data.link
    postData.image_link = data.images.standard_resolution.url

    if (typeof data.videos !== 'undefined') {
      // console.log("true");
      postData.video_link = data.videos.standard_resolution.url
    } else {
      // console.log("false")
      delete postData.video_link
    }

    postData.caption = data.caption.text
    postData.likes = data.likes.count
    postData.comments = data.comments.count

    postTags('tags', data.tags, function (tags) {
      // console.log('Tags: ',tags);
      postData.tags = tags
      postToTable('posts', postData)
    })
    // console.log(postData);
    // postToTable('posts', postData);
  })
})

// Takes an instagram url and returns the shortcode after /p/
function getIgShortCode (url) {
  // expecting http://instagr.am/p/BWl6P/
  var linkrx = /\/p\/([^\/]+)\/$/
  // find /p/, then 1 or more non-slash as capture group 1, then / and EOL
  if (url.match(linkrx) !== null) {
    var shortcode = url.match(linkrx)[1]
    return (shortcode)
  };
}

