var YQL = require('yql');

function MessageStack(maxStackSize, maxWaitTime) {
	var maxStackSize = maxStackSize || 4;
	var maxWaitTime = maxWaitTime || 10000;
	var messages = [];
	var keywords = [];
	var searchTimer;
	var on = {};

	var searchThresholdReached = function() {
		console.log('searchThresholdReached()')
		searchTimer = null;
		if (on.searchThresholdReached) {
			on.searchThresholdReached(messages);
		}
		messages = [];
	}

	this.push = function(message) {
		messages.push(message);

		if (messages.length >= maxStackSize) {
			searchThresholdReached();
		}
		else {
			searchTimer = setTimeout(searchThresholdReached, 10000);
		}
		// if (messages.length > maxStackSize) {
		// 	newIndexZero = messages.length - maxStackSize;
		// 	messages = messages.slice(newIndexZero, newIndexZero + maxStackSize - 1);
		// }

		// keywordQuery = "";
		// if (unprocessedMessages.length > 1) {
		// 	for (i=0; i < unprocessedMessages.length; i++)
		// 		keywordQuery = keywordQuery + " " + unprocessedMessages.pop();

		// 	YQL.exec("select * from contentanalysis.analyze where text=\"" + keywordQuery + "\"", function(response) {
		// 		console.log(response);
		// 		if (response.query.results.count) {
		// 			for (something in response.query.results.entities)
		// 				console.log(something);
		// 		}
		// 	});
		// }
	}

	this.messages = function() {
		return messages;
	}

	this.on = function(event, callback) {
		on[event] = callback;
	}
}

module.exports = MessageStack;