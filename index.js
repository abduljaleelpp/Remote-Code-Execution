#!/usr/bin/node

const http = require('http'),
   path = require('path'),
   url = require('url'),
   fs = require('fs'),
   process = require('process');

if( process.argv.length != 4 ){
   console.info("Need 2 parameters: local_ip local-port");
   process.exit( 0 );
}

const local_ip  = process.argv[2];
const local_port= process.argv[3];


const redis_command = JSON.stringify(
   fs.readFileSync("redis_command.txt").toString() 
   //remove first and last characters that are " "
   ).slice(1, -1);

console.log("redis command: ******")
console.log(redis_command)
console.log("*********************")

function hash( str ){
   if( ! str )
      return "";
   return str.replace(/[\W_]+/g,"_");
}

function log( req, isRequest ){
   const prefix = (isRequest? "> " : "< ");
   const id = hash( isRequest? req.url : req._req.url );
   
   if( isRequest )
      console.log( prefix + req.method + ' ' + req.url)
   else 
      console.log( prefix + req.statusCode + ' ' + req.statusMessage );

   console.log( prefix + "request_id: " + id );

   for( var h in req.headers )
      console.log( prefix + h + ': ' + req.headers[h] );

   console.log( prefix );
}



function sendFile( response, filePath ){
   console.log("<  send file: " + filePath );
   let data = fs.readFileSync(filePath).toString();

   //override our local url
   data = data.replace(/HOST_URL/g, `http://${local_ip}:${local_port}`);
   data = data.replace(/REDIS_COMMANDS/g, redis_command);
   response.end( data );
}

let index = 0;

const server = http.createServer(function(client_req, client_res) {
   //log
   console.log("");
   console.log( new Date());
   console.log( (++index) + ". new connection from ", client_req.connection.remoteAddress );//client IP

   log( client_req, true );

   client_res.writeHead(200, {
      "content-type":"application/json; charset=utf-8",
      "x-ratelimit-limit":"5000",
      "x-ratelimit-remaining":"4991",
      "x-ratelimit-reset":"1660136749",
      "x-ratelimit-used":"9",
      "x-ratelimit-resource":"core"
   });


   const bodyFile = hash( client_req.url ) + ".res.body.txt";
   if( fs.existsSync( bodyFile ))
      return sendFile( client_res, bodyFile );
   
   //nothing
   return client_res.end("[]");
})

server.on('clientError', function onClientError(err, socket) {
   console.log('clientError', err)
   socket.end('HTTP/1.1 400 Bad Request\r\n\r\n')
})

server.listen( local_port, local_ip, function() {
   console.log(`HTTP server is listening on ${local_ip}:${local_port}`  );
})
