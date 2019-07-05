/**
 * Apply a function on all elements. It can also be used on objects for which it
 * will map on object values but keep keys.
 * @param {Function} cb Function to apply on each elements
 * @returns {Function}
 */
const map = cb => d => Array.isArray(d) ?
  d.map(cb)
  : Object.keys(d).reduce((p, c) => Object.assign(p, { [c]: cb(d[c]) }), {});

/**
 * Reduce an array or an object.
 * @param {Function} cb Function to use when reducing the object
 * @param {any} start Accumulator default state
 * @returns {Function}
 */
const reduce = (cb, start) => d => Array.isArray(d) ?
  d.reduce(cb, start || [])
  : Object.keys(d).reduce((p, c) => cb(p, d[c], c), start || {});

/**
 * Flatten an array or an object values.
 * @param {any} d Array or object to flatten
 * @returns {Array}
 */
const flatten = d => Array.isArray(d) ?
  d.reduce((p, c) => p.concat(c), [])
  : flatten(Object.values(d));

/**
 * Mostly used with reduce, append one or more elements to an array or an object.
 * @param {...any} v Values to append
 * @returns {Object|Array}
 */
const append = (...v) => d => Array.isArray(d) ?
  d.concat(...v)
  : Object.assign(d, ...v);

/**
 * Clone an object.
 * @param {Object} o Object to clone
 * @returns {Object}
 */
const clone = o => Object.assign({}, o);

/**
 * Always returns the given value, used mostly for initialisation.
 * @param {any} v Value to return
 * @returns {Function}
 */
const always = v => () => v;

/**
 * Retrieve an object property.
 * @param {String} p Property to retrieve
 * @returns {Function} 
 */
const prop = p => d => d[p];

/**
 * Filter an array.
 * @param {Function} cb Function used for filtering
 * @returns {Function}
 */
const filter = cb => d => d.filter(cb);

/**
 * Instantiate a class.
 * @param {Function} klass Class ctor to use
 * @param  {...any} args Arguments to use
 * @returns {Function}
 */
const instantiate = (klass, ...args) => d => new klass(d, ...args);

/**
 * Retrieve the first element of an array.
 * @param {Array} d The array
 * @returns {Function}
 */
const first = d => d[0];

/**
 * Retrieve the last element of an array.
 * @param {Array} d The array
 * @returns {Function}
 */
const last = d => d[d.length - 1];

/**
 * Returns a function which pipe the given ones.
 * @param  {...any} functions Functions to chain
 * @returns {Function}
 */
const pipe = (...functions) => args => functions.reduce((arg, fn) => fn(arg), args);

module.exports = {
  append,
  clone,
  first,
  last,
  map,
  filter,
  reduce,
  flatten,
  always,
  prop,
  instantiate,
  pipe,
};
