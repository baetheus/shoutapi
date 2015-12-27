Node.js module to interact with official [Shoutpoint Api](https://dev-shoutpointapi.devportal.apigee.com)

```sh
npm install shoutapi
```

## Client
The shoutapi.client object contains methods for direct use with the Shoutpoint apis: Dials, LiveCalls, LiveIVRs, and PhoneNumbers. Currently, only the PhoneNumbers and parts of the Dials apis have been implemented.

```js
var shoutapi = require('shoutapi');

var token = 'YOUR_SHOUTPOINT_API_KEY';

// Setup client
var client = shoutapi(token).client;

// Output available phone numbers.
client.numbers.available({search_by: 'area-code', search_on: '949'}, console.log);

```

### client.numbers.list(api, callback)
List numbers attached to api.

| Param | Type | Description |
| --- | --- | --- |
| api | <code>String</code> | API to list. ex. LiveIVRs, ParkingLot |
| callback | <code>Function</code> | Callback function will receive error, response. |

### client.numbers.available(opts, callback)
List numbers that are available for use.

| Param | Type | Description |
| --- | --- | --- |
| opts | <code>Object</code> | Acceptable options are search_by and search_on. |
| callback | <code>Function</code> | Callback function will receive error, response. |

### client.numbers.assign(api, numbers, callback)
Assign a number to an inbound api.

| Param | Type | Description |
| --- | --- | --- |
| api | <code>String</code> | API to list. ex. LiveIVRs, ParkingLot |
| numbers | <code>String</code> &#124; <code>Array</code> | A phone number presented as a string or an array of numbers presented as strings. |
| callback | <code>Function</code> | Callback function will receive error, response. |

### client.numbers.park(numbers, callback)
Park unassigned numbers for later use.

| Param | Type | Description |
| --- | --- | --- |
| numbers | <code>String</code> &#124; <code>Array</code> | A phone number presented as a string or an array of numbers presented as strings. |
| callback | <code>Function</code> | Callback function will receive error, response. |

### client.numbers.release(numbers, callback)
Release numbers from an inbound api.

| Param | Type | Description |
| --- | --- | --- |
| api | <code>String</code> | API to list. ex. LiveIVRs, ParkingLot |
| numbers | <code>String</code> &#124; <code>Array</code> | A phone number presented as a string or an array of numbers presented as strings. |
| callback | <code>Function</code> | Callback function will receive error, response. |

## Events
The shoutapi.server object is an event emitter that provides a restify-type route. This route accepts [callback style](https://dev-shoutpointapi.devportal.apigee.com/docs/apis/live-ivrs) messages and emits events for type, status, and regex entries for to_no, from_no, and app_id. Since many events can be emitted for the same message, care should be taken not to duplicate responses.

```js
var shout = require('shoutapi')('YOUR_SHOUTPOINT_API_KEY').server,
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