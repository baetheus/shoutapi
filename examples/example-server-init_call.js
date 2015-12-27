/*jslint node: true */
/*jslint white: true */
'use strict';

var shout = require('shoutapi')('YOUR-SHOUTPOINT-API-KEY').server,
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
        text: 'You have reached your destination. Here is a text message.',
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

  data.res.send({actions: actions});
  data.next();
});

server.listen(80, function() {
  console.log('%s listening at %s', server.name, server.url);
});