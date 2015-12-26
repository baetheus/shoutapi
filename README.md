Node.js module to interact with official [Shoutpoint Api](https://dev-shoutpointapi.devportal.apigee.com)

```sh
npm install shoutapi
```

### Client
The shoutapi.client object contains methods for direct use with the Shoutpoint apis: Dials, LiveCalls, LiveIVRs, and PhoneNumbers. Currently, only the PhoneNumbers and parts of the Dials apis have been implemented.

```js
var shoutapi = require('shoutapi');

var token = 'YOUR_SHOUTPOINT_API_KEY';

// Setup client
var client = shoutapi(token).client;

// Output available phone numbers.
client.available({}, console.log);

```

### Events
The shoutapi.server object is an event emitter that provides a restify-type route. This route accepts [callback style](https://dev-shoutpointapi.devportal.apigee.com/docs/apis/live-ivrs) messages and emits events for type, status, and regex entries for to_no, from_no, and app_id. Since many events can be emitted for the same message, care should be taken not to duplicate responses.

```js
var shout = require('shoutapi').server,
    restify = require('restify'),
    server = restify.createServer();

// Configure restify server and route
server.use(restify.bodyParser({ mapParams: false }));
server.post('/', shout.route);

// Create listener on 'sms' event
shout.on('sms', function (data) {
  console.log('Received sms:', data.message);
  data.res.send(200);
  data.next();
});

// Create regex listener for 'to' number
shout.onTo(/^1949/, function (data) {
  console.log('Received message to a number starting with 1949:', data.message);
  data.res.send(200);
  data.next();
});

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});

```

Not all features of the client or server have been implemented as this is a proof of concept.
