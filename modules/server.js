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

    // Regex route parsing.
    function regexRoute(type, regRoute) {
      var match = regRoute.regexp.exec(message[type]);
      if (match) {
        log.debug(regRoute, 'Emitting regex route.');
        regRoute.callback(output, match);
      }
    }
    function onAppRoute(regRoute) {
      regexRoute('app_id', regRoute);
    }
    function onToRoute(regRoute) {
      regexRoute('to_no', regRoute);
    }
    function onFromRoute(regRoute) {
      regexRoute('from_no', regRoute);
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
        lodash.forEach(regexApp, onAppRoute);
      }

      // Emit regex to matches
      if (message.to_no) {
        lodash.forEach(regexTo, onToRoute);
      }

      // Emit regex from matches
      if (message.from_no) {
        lodash.forEach(regexFrom, onFromRoute);
      }

    }
  };

  return that;
};