console.log('serving your assets on 8080')
var express = require('express')
var app = express().use(express.static(__dirname)).listen(8080)
console.log('sockets on 8888')
var io = require('socket.io').listen(app);
var allPresentations, excludedFolders = ['dummy', 'shared'];
var fs, getDirs;
fs = require('fs');

io.configure(function () {
  
  // recommended production testing
  //io.enable('browser client minification');  // send minified client
  //io.enable('browser client etag');          // apply etag caching logic based on version number
  //io.enable('browser client gzip');          // gzip the file
  
  io.set('log level', 1); // reduce level of logging to warning only
  
  io.set('transports', [
      'websocket'
    , 'htmlfile'
    , 'xhr-polling'
    , 'jsonp-polling'
  ]);
  
  
});
getDirs = function(rootDir) {
  var dirs, file, filePath, files, stat, _i, _len;
  files = fs.readdirSync(rootDir);
  dirs = [];
  for (_i = 0, _len = files.length; _i < _len; _i++) {
    file = files[_i];
    if (file[0] !== '.') {
      filePath = "" + rootDir + "/" + file;
      stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        dirs.push(file);
      }
    }
  }
  return dirs;
};

allPresentations = getDirs(__dirname).filter(function(folderName){return excludedFolders.indexOf(folderName) == -1});
allPresentations = allPresentations.reduce(function(allReduced, currentValue, index, array){
  allReduced[currentValue] = {
    indexv: 0,
    indexh: 0
  };
  return allReduced;
}, {})
console.log(allPresentations);
// setup remote control here
// socket.io setup
io.sockets.on('connection', function (socket) {
  // once connected need to broadcast the cur slide data
   socket.on('request_presentation', function(data){
    if(allPresentations[data.id])
    {
      console.log('sending init presentation data ' + JSON.stringify(allPresentations[data.id]) );
      socket.emit('initdata', allPresentations[data.id]);
    }
   });
  // send commands to make slide go previous/ next/etc
  // this should be triggered from the remote controller
  socket.on('command', function(command) {
    console.log("receive command " + JSON.stringify(command) );
    // TODO: future might need a way to tell how many slides there are
    var pptId = command.id;  // powerpoint id
    var cmd = command.txt;   // command can be 'up', 'down', 'left', 'right'
    if(allPresentations[pptId])
    {
      var curppt = allPresentations[pptId];
      curppt.cmd = cmd;
      curppt.id = pptId
      // update ppt information
      if(cmd == 'up')
      {
        curppt.indexv--;
      }
      else if(cmd == 'down')
      {
        curppt.indexv++;
      }
      else if(cmd == 'left')
      {
        curppt.indexh--;
      }
      else if(cmd == 'right')
      {
        curppt.indexh++;
      }
      if(curppt.indexh < 0 )
        curppt.indexh = 0;
      if(curppt.indexv < 0 )
        curppt.indexv = 0;
      allPresentations[pptId] = curppt;
      console.log('sending data:', curppt)
      // send the new data for update
      socket.broadcast.emit('updatedata', curppt);
    }
  });
});