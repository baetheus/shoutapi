/*jslint node: true */
/*jslint white: true */
'use strict';

var EventEmitter = require('events').EventEmitter;

var Logger = require('bunyan');
var lodash = require('lodash');

var log = new Logger({
  name: 'shoutapi-server',
  streams: [
    {
      stream: process.stdout,
      level: 'debug'
    }
  ]
  // Write a bunyan serializer once you've got a grasp on api responses.
});

module.exports = function apiServer() {
  var that = new EventEmitter(),
      regexApp = [],
      regexTo = [],
      regexFrom = [],
      statusTypes = [
        'ringing', 'in-progress', 'inbound-sms', 'canceled', 'completed', 
        'operator', 'answering-machine', 'fax', 'pbx', 'failed', 'busy',
        'no-answer', 'unknown'
      ],
      messageTypes = [
        'init_call', 'live_call', 'end_call', 'sms'
      ];

  that.onApp = function onApp(regexp, callback) {
    regexApp.push({regexp: regexp, callback: callback});
  };

  that.onTo = function onTo(regexp, callback) {
    regexTo.push({regexp: regexp, callback: callback});
  };

  that.onFrom = function onFrom(regexp, callback) {
    regexFrom.push({regexp: regexp, callback: callback});
  };

  that.route = function route(req, res, next) {
    log.debug({body: req.body}, 'Received body.');
    var message = req.body.message,
        output = {
          message: message,
          req: req,
          res: res,
          next: next
        };

    function regexRoute(regRoute) {
      var match = regRoute.regexp.exec(message.text);
      if (match) {
        log.debug(regRoute, 'Emitting regex route.');
        regRoute.callback(output, match);
      }
    }
    
    if (message !== 'undefined') {
      log.trace({message: message}, 'Emitting message.');
      that.emit('message', output);
      
      // Emit type
      if (lodash.includes(messageTypes, message.type)) {
        that.emit(message.type, output);
      }

      // Emit status
      if (lodash.includes(statusTypes, message.status)) {
        that.emit(message.status, output);
      }

      // Emit regex app matches
      if (message.app_id) {
        lodash.forEach(regexApp, regexRoute);
      }

      // Emit regex app matches
      if (message.to_no) {
        lodash.forEach(regexTo, regexRoute);
      }

      // Emit regex app matches
      if (message.from_no) {
        lodash.forEach(regexFrom, regexRoute);
      }

    }
  };

  return that;
};