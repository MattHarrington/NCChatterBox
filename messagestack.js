var MessageStack = function(maxStackSize) {
	var maxStackSize = maxStackSize || 25;
	var messages = [];

	this.push = function(message) {
		messages.push(message);
		if (messages.length > maxStackSize) {
			newIndexZero = messages.length - maxStackSize;
			messages = messages.slice(newIndexZero, newIndexZero + maxStackSize - 1);
		}
	}

	this.messages = function() {
		return messages;
	}
}

module.export = MessageStack;