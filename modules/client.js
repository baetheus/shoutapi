/*jslint node: true */
/*jslint white: true */
'use strict';

var sprintf = require('util').format;
var assert = require('assert');
var url = require('url');

var request = require('request');
var Logger = require('bunyan');

var log = new Logger({
  name: 'shoutapi-client',
  streams: [
    {
      stream: process.stdout,
      level: 'debug'
    }
  ]
  // Write a bunyan serializer once you've got a grasp on api responses.
});

module.exports = function apiClient(token) {
  var that = {},
      api = {
        types: ['Dials', 'LiveCalls', 'LiveIVRs', 'PhoneNumbers'],
        ver: 'v0'
      };

  assert.equal(typeof token, 'string');

  // Private Functions
  function buildUrl(path) {
    return url.format({
      protocol: 'https',
      host: 'api.shoutpoint.com',
      pathname: sprintf('/%s/%s', api.ver, path)
    });
  }

  function apiCall(params, callback) {
    params.json = true;
    params.headers = {
      'X-API-Key': token
    };
    log.debug({params: params}, 'Attempting api.');
    request(params, function apiResponse(err, res, body) {
      log.trace({res: res}, 'Api Response.');
      log.debug({err: err, params: params}, 'Completed api post.');
      callback(err, body);
    });
  }

  function apiGet(params, callback) {
    params.method = 'GET';
    apiCall(params, callback);
  }

  function apiPost(params, callback) {
    params.method = 'POST';
    apiCall(params, callback);
  }

  function apiDelete(params, callback) {
    params.method = 'DELETE';
    apiCall(params, callback);
  }

  function strToAr(obj) {
    var result;
    if (typeof obj === 'string') {
      result = [obj];
    } else if (obj instanceof Array) {
      result = obj;
    } else {
      result = [];
    }
    return result;
  }

  // PhoneNumbers API
  function generalListNumbers(api, opts, callback) {
    var params = {
      qs: opts,
      url: buildUrl('PhoneNumbers/' + api)
    };
    apiGet(params, callback);
  }

  function listNumbers(api, callback) {
    generalListNumbers(api, {}, callback);
  }

  function availableNumbers(opts, callback) {
    generalListNumbers('Available', opts, callback);
  }

  function provisionNumber(api, numbers, callback) {
    var params = {
      url: buildUrl('PhoneNumbers/' + api),
      body: strToAr(numbers)
    };
    apiPost(params, callback);
  }

  function parkNumber(numbers, callback) {
    provisionNumber('ParkingLot', numbers, callback);
  }

  function releaseNumber(api, numbers, callback) {
    var params = {
      url: buildUrl('PhoneNumbers/' + api),
      body: strToAr(numbers)
    };
    apiDelete(params, callback);
  }

  that.numbers = {
    list: listNumbers,
    available: availableNumbers,
    assign: provisionNumber,
    park: parkNumber,
    release: releaseNumber
  };

  // Dials API
  function smsDials(body, callback) {
    var params = {
      url: buildUrl('Dials/SMS'),
      body: body
    };
    apiPost(params, callback);
  }

  function connectDials(body, callback) {
    var params = {
      url: buildUrl('Dials/Connect'),
      body: body
    };
    apiPost(params, callback);
  }

  function cttDials(body, callback) {
    var params = {
      url: buildUrl('Dials/ClickToTalk'),
      body: body
    };
    apiPost(params, callback);
  }

  that.dials = {
    connect: connectDials,
    sms: smsDials,
    ctt: cttDials
  };

  // LiveIVRs API
  function getIVR(number, callback) {
    var params = {
      url: buildUrl('LiveIVRs/Callbacks' + number),
    };
    apiGet(params, callback);
  }

  function listIVR(callback) {
    var params = {
      url: buildUrl('LiveIVRs/Callbacks'),
    };
    apiGet(params, callback);
  }

  function configIVR(body, callback) {
    var params = {
      url: buildUrl('LiveIVRs/Callbacks'),
      body: body
    };
    apiPost(params, callback);
  }

  function removeIVR(callback) {
    var params = {
      url: buildUrl('LiveIVRs/Callbacks'),
    };
    apiDelete(params, callback);
  }

  that.ivrs = {
    get: getIVR,
    list: listIVR,
    config: configIVR,
    remove: removeIVR
  };

  return that;
};
