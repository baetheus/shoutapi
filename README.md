# shoutapi

Node.js module to interact with official [Shoutpoint Api](https://dev-shoutpointapi.devportal.apigee.com). This is a very early package and is under very active development. The Shoutpoint API is also very fresh and is likely going to change. Don't expect any of the methods or endpoints to be stable.

```sh
npm install shoutapi
```

## Client
The shoutapi.client object contains methods for direct use with the Shoutpoint apis: Dials, LiveCalls, LiveIVRs, and PhoneNumbers. Currently, only parts of the PhoneNumbers, Dials, and LiveIVRs apis have been implemented..

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
| api | <code>String</code> | API name. ex. Dials, LiveCalls, LiveIVRs, PhoneNumbers. |
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
| api | <code>String</code> | API name. ex. Dials, LiveCalls, LiveIVRs, PhoneNumbers. |
| numbers | <code>String</code> &#124; <code>Array</code> | A phone number presented as a string or an array of numbers presented as strings. |
| callback | <code>Function</code> | Callback function will receive error, response. |

### client.numbers.park(numbers, callback)
Park unassigned numbers for later use.

| Param | Type | Description |
| --- | --- | --- |
| numbers | <code>String</code> &#124; <code>Array</code> | A phone number presented as a string or an array of numbers presented as strings. |
| callback | <code>Function</code> | Callback function will receive error, response. |

### client.numbers.release(api, numbers, callback)
Release numbers from an inbound api.

| Param | Type | Description |
| --- | --- | --- |
| api | <code>String</code> | API name. ex. Dials, LiveCalls, LiveIVRs, PhoneNumbers. |
| numbers | <code>String</code> &#124; <code>Array</code> | A phone number presented as a string or an array of numbers presented as strings. |
| callback | <code>Function</code> | Callback function will receive error, response. |

### client.dials.connect(body, callback)
Dial a phone number.

| Param | Type | Description |
| --- | --- | --- |
| body | <code>Object</code> | A JSON object of the following form found [here](https://dev-shoutpointapi.devportal.apigee.com/dials-api/apis/post/Connect). |
| callback | <code>Function</code> | Callback function will receive error, response. |

### client.dials.sms(body, callback)
Send an sms message.

| Param | Type | Description |
| --- | --- | --- |
| body | <code>Object</code> | A JSON object of the following form found [here](https://dev-shoutpointapi.devportal.apigee.com/docs/apis/dials/sms). |
| callback | <code>Function</code> | Callback function will receive error, response. |

### client.dials.ctt(body, callback)
Initiate a ClickToTalk Call.

| Param | Type | Description |
| --- | --- | --- |
| body | <code>Object</code> | A JSON object of the following form found [here](https://dev-shoutpointapi.devportal.apigee.com/dials-api/apis/post/ClickToTalk). |
| callback | <code>Function</code> | Callback function will receive error, response. |

### client.ivrs.get(number, callback)
Get the callback configuration for a specific IVR number.

| Param | Type | Description |
| --- | --- | --- |
| number | <code>String</code> | A phone number presented as a string. |
| callback | <code>Function</code> | Callback function will receive error, response. |

### client.ivrs.list(callback)
Get the callback configuration for all configured numbers.

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>Function</code> | Callback function will receive error, response. |

### client.ivrs.config(body, callback)
Configure any number of callbacks for inbound numbers.

| Param | Type | Description |
| --- | --- | --- |
| body | <code>Object</code> | A JSON object of the following form found [here](https://dev-shoutpointapi.devportal.apigee.com/liveivrs-api/apis/post/PhoneNumbers). |
| callback | <code>Function</code> | Callback function will receive error, response. |

### client.ivrs.list(callback)
Remove all callback configurations for IVRs.

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>Function</code> | Callback function will receive error, response. |

## Events
The shoutapi.server object is an event emitter that provides a restify-type route. This route accepts [callback style](https://dev-shoutpointapi.devportal.apigee.com/docs/apis/live-ivrs) messages and emits events for type, status, and regex entries for to_no, from_no, and app_id. Since many events can be emitted for the same message, care should be taken not to duplicate responses.

```sh
npm install shoutapi restify
```

```js
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

```

Not all features of the client or server have been implemented as this is a proof of concept.