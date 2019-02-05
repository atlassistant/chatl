const parse = require('./parser').parse;
const adapters = require('./adapters');
const toJSON = require('./utils').toJSON;

module.exports = {
  adapters,
  parse,
  toJSON,
};