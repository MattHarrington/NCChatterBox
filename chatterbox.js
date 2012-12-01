var socket = require('websocket').server;
var http = require('http');
var fs = require('fs');


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
	fs.readFile('./index.html', function (err, data) {
	    if (err) {
	        throw err;
	    }
	    response.writeHeader(200,{"Content-Type":"text/html"});
	    response.write(data);
	    response.end();
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
					var welcome = '<b>User <span style="color:' + userColor + '">' + userName + '</span> has joined the room!</b>';
					console.log(welcome);
					for(var i=0;i<clients.length;i++){
						clients[i].sendUTF(welcome);
					}
				}
				else
				{
					console.log(message.utf8Data);
					for(var i=0;i<clients.length;i++){
						clients[i].sendUTF(userName + ': <span style="color:' + userColor + '">' + message.utf8Data + '</span>');
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