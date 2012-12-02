var https = require('https');

var BingApiClient = function(key) {
	var accountKey = key || null;

	this.setApiKey = function(key) {
		accountKey = key;
	}

	this.search = function(query, callback, parameters) {
		var source = '%27web%2bnews%2bimage%27';
		var latitude = escape(parameters.latitude || 39.2615);
		var longitude = escape(parameters.longitude || -121.0163);

		var options = {
			hostname:'api.datamarket.azure.com',
			path:'/Data.ashx/Bing/Search/v1/Composite?Sources=' + source + '&Query=' + escape('\'' + query + '\'') + '&Latitude=' + latitude + '&Longitude=' + longitude + '&$top=50&$format=json',
			auth:'user:' + accountKey
		};

		console.log('searching: https://' + options.hostname + options.path);

		var req = https.request(options, function(res){
			console.log('STATUS: ' + res.statusCode);
			console.log('HEADERS: ' + JSON.stringify(res.headers));
			res.setEncoding('utf8');
			res.on('data', function (chunk) {
				console.log('DATA: ' + chunk);
				var error = null;
				if (res.statusCode != 200) {
					error = true;
				}
				if (callback)
					callback(error, chunk);
			});
		});

		req.on('connect', function(){
			console.log('connection made');
		});

		req.on('error', function(e) {
			console.log('problem with request: ' + e.message);
		});

		req.end();
	}
}

module.exports = BingApiClient;