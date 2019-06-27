module.exports = {
  map: cb => d => Array.isArray(d) ?
    d.map(cb)
    : Object.keys(d).reduce((p, c) => Object.assign(p, { [c]: cb(d[c]) }), {}),
  reduce: cb => d => Array.isArray(d) ?
    d.reduce(cb, [])
    : Object.keys(d).reduce((p, c) => cb(p, d[c], c), {}),
  always: v => () => v,
  prop: p => d => d[p],
  instantiate: klass => d => new klass(d),
  pipe: (...functions) => args => functions.reduce((arg, fn) => fn(arg), args),
};
