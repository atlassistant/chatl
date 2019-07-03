const map = cb => d => Array.isArray(d) ?
  d.map(cb)
  : Object.keys(d).reduce((p, c) => Object.assign(p, { [c]: cb(d[c]) }), {});

const reduce = (cb, start) => d => Array.isArray(d) ?
  d.reduce(cb, start || [])
  : Object.keys(d).reduce((p, c) => cb(p, d[c], c), start || {});

const flatten = d => Array.isArray(d) ?
  d.reduce((p, c) => p.concat(c), [])
  : flatten(Object.values(d));

const append = (...v) => d => Array.isArray(d) ?
  d.concat(...v)
  : Object.assign(d, ...v);

const clone = o => Object.assign({}, o);
const always = v => () => v;
const prop = p => d => d[p];
const instantiate = (klass, ...args) => d => new klass(d, ...args);
const first = d => d[0];
const last = d => d[d.length - 1];
const set = cb => d => cb(d) && d;
const pipe = (...functions) => args => functions.reduce((arg, fn) => fn(arg), args);

module.exports = {
  append,
  clone,
  first,
  last,
  set,
  map,
  reduce,
  flatten,
  always,
  prop,
  instantiate,
  pipe,
};
