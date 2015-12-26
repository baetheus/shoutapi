/*jslint node: true */
/*jslint white: true */
'use strict';

module.exports = function shoutpoint(token) {
  var that = {};

  that.client = require('./modules/client')(token);
  that.server = require('./modules/server');

  return that;
};
