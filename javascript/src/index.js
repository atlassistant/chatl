const parse = require('./parser').parse;
const adapters = require('./adapters');
const utils = require('./utils');

module.exports = {
  adapters,
  parse,
  utils,
  merge: utils.merge,
};