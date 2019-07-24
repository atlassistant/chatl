const parse = require('./parser').parse;
const adapters = require('./adapters');
const merge = require('./utils').merge;

module.exports = {
  adapters,
  parse,
  merge,
};