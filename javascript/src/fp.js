const map = cb => d => Array.isArray(d) ?
  d.map(cb)
  : Object.keys(d).reduce((p, c) => Object.assign(p, { [c]: cb(d[c]) }), {});

const reduce = cb => d => Array.isArray(d) ?
  d.reduce(cb, [])
  : Object.keys(d).reduce((p, c) => cb(p, d[c], c), {});

const flatten = d => Array.isArray(d) ?
  d.reduce((p, c) => p.concat(c), [])
  : flatten(Object.values(d));

const always = v => () => v;
const prop = p => d => d[p];
const instantiate = klass => d => new klass(d);
const pipe = (...functions) => args => functions.reduce((arg, fn) => fn(arg), args);

module.exports = {
  map,
  reduce,
  flatten,
  always,
  prop,
  instantiate,
  pipe,
};
