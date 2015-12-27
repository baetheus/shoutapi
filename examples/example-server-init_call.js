/*jslint node: true */
/*jslint white: true */
'use strict';

var shout = require('shoutapi')('k37j6AHHMZRklQuTfD8JlAgu3aPEtaqS').server,
    restify = require('restify'),
    server = restify.createServer();

// Configure restify server and route
server.use(restify.bodyParser({ mapParams: false }));
server.post('/', shout.route);

// Create a listener for 'init_call' type.
shout.on('init_call', function (data) {
  console.log('A call has been initialized.', data.message);

  var actions = [
    {
      type: 'SAY',
      params: {
        text: 'You have reached shout dot null dot pub. Here is a text message.',
      }
    },
    {
      type: 'SMS',
      params: {
        no: data.message.from_no,
        caller_id_no: data.message.to_no,
        message: 'Wherein I send you a text message.'
      }
    },
    {
      type: 'HANGUP'
    }
  ];

  data.res.send(actions);
  data.next();
});

server.listen(80, function() {
  console.log('%s listening at %s', server.name, server.url);
});