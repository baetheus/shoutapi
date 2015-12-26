Node.js module to interact with official [Shoutpoint Api](https://dev-shoutpointapi.devportal.apigee.com)

```sh
npm install shoutapi
```

```js
var shoutapi = require('shoutapi');

var token = 'YOUR_SHOUTPOINT_API_KEY';

// Setup client
var client = shoutapi(token).client;

// Output available phone numbers.
client.numbers.available({}, console.log);

```

### Events
The shoutapi.server object is an event emitter that provides a restify-type route to create events. Since this is an event emitter, care should be taken not to duplicate responses.

```js
var shout = require('shoutapi').server,
    restify = require('restify'),
    server = restify.createServer();

// Configure restify server and route
server.use(restify.bodyParser({ mapParams: false }));
server.post('/', shoutapi.server.route);

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
