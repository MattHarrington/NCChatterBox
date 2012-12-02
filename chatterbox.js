var socket = require('websocket').server;
var http = require('http');
var fs = require('fs');
var restify = require('restify');
var path = require('path');
var MessageStack = require('./messagestack.js');
var BingApiClient = new require('./bing.js');

var messages = new MessageStack(4, 5000);
var bing = new BingApiClient('+AVkkVL+grU5/kkPGs8xfeh7dRflZc+embQOsWp5J7E=');

//https://api.datamarket.azure.com/Bing/Search/$Appid=%27B2B7f47katatJT4XvgogME9%2BWFlcG2c9lVm8tF7q9DM%3D%27&$Query=testign&$Sources=web+spell

function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function getRandomHexColor () {
    return 'rgb(' + (Math.floor(Math.random() * 255) + ',') + (Math.floor(Math.random() * 255) + ',') + (Math.floor(Math.random() * 255) + '') + ')';
}

var server = http.createServer(function(request, response){
	//keep it simple, just return one page no mater what...
	console.log("Request made for URL: " + request.url)
    var filePath = '.' + request.url;
    if (filePath == './')
        filePath = './index.html';
         var extname = path.extname(filePath);

    var contentType = 'text/html';
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
    }

    fs.exists(filePath, function(exists) {
     
        if (exists) {
            fs.readFile(filePath, function(error, content) {
                if (error) {
                	console.log("No page found. Error: " + error)
                    response.writeHead(500);
                    response.end();
                }
                else {
                    response.writeHead(200, { 'Content-Type': contentType });
                    response.end(content, 'utf-8');
                }
            });
        }
        else {
            response.writeHead(404);
            response.end();
        }
    });
});

server.listen(1111,function(){
	console.log('Http server is listening on port 1111');
});

var socketServer = new socket({
	httpServer: server
});

var clients = [];

socketServer.on('request', function(request){
	var connection = request.accept(null, request.origin);
	var userName = false;
	var userColor = false;

	clients.push(connection);
	
	function pushToClients(type, message) {
		var pushObject = {
			type: type,
			message: message
		};
		for (i=0; i < clients.length; i++) {
			clients[i].send(pushObject);
		}
	}

	connection.on('message',function(message){
		if(message.type ==='utf8'){

			if(userName === false){
				userName = htmlEntities(message.utf8Data);
				userColor = getRandomHexColor();
				var welcome = '<b>User <span style="color:' + userColor + '">' + htmlEntities(userName) + '</span> has joined the room!</b>';
				console.log(welcome);
				pushToClients('chat', welcome);
			}
			else
			{
				console.log(message.utf8Data);
				messages.push(message);
				pushToClients('chat', userName + ': <span style="color:' + userColor + '">' + htmlEntities(message.utf8Data) + '</span>');
			}
		}
	});

	connection.on('close', function(connection){
		var bye = '<b>User <span style="color:' + userColor + '">' + userName + '</span> has left the room!</b>';
		console.log(bye);
		pushToClients('chat', bye);
	});

	messages.on('searchThresholdReached', function(messages) {
		console.log('searching for ' + messages.length + ' messages');

		var query = messages.join(' ');
		
		bing.search(query, function(err, results) {
			if (err) {
				console.log('search error ??');
				return;
			}
			console.log(results);
			pushToClients('search', results);
		}, {});

	});
});