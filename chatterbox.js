var socket = require('websocket').server;
var http = require('http');
var fs = require('fs');
var restify = require('restify');
var path = require('path');


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
		
		connection.on('message',function(message){
			if(message.type ==='utf8'){

				if(userName === false){
					userName = htmlEntities(message.utf8Data);
					userColor = getRandomHexColor();
					var welcome = '<b>User <span style="color:' + userColor + '">' + htmlEntities(userName) + '</span> has joined the room!</b>';
					console.log(welcome);
					for(var i=0;i<clients.length;i++){
						clients[i].sendUTF(welcome);
					}
				}
				else
				{
					console.log(message.utf8Data);
					for(var i=0;i<clients.length;i++){
						clients[i].sendUTF(userName + ': <span style="color:' + userColor + '">' + htmlEntities(message.utf8Data) + '</span>');
					}
				}
			}
		});

		connection.on('close', function(connection){
			var bye = '<b>User <span style="color:' + userColor + '">' + userName + '</span> has left the room!</b>';
					console.log(bye);
					for(var i=0;i<clients.length;i++){
						clients[i].sendUTF(bye);
					}
			});
	});