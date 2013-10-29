  head.js( '/socket.io/socket.io.js' , function() {

    // connect
    var socket = io.connect('/');

    socket.on('connect', function () {
      console.log("client connected. Sending cur slide request");


      // on connect send presentation request
      socket.emit('request_presentation', {'id': presentation_id} );

      // init data
      socket.on('initdata', function(data) {
        console.log("Init data: " + JSON.stringify(data) );
        if(data.id == presentation_id)
        {
          // go to the respective slide
          Reveal.navigateTo(data.indexh, data.indexv);
        }
      });

      socket.on('updatedata', function(data) {
        console.log("Receive update data: " + JSON.stringify(data) );

        if(data.id == presentation_id)
        {
          // go to the respective slide
          Reveal.navigateTo(data.indexh, data.indexv);
        }
      });


    });

  } );