const expect = require('chai').expect;
const fp = require('./fp');

describe('the fp module', function () {

  class SayHello {
    constructor(name, other_prop) {
      this.name = name;
      this.other_prop = other_prop;
    }
  }

  const tests = [
    {
      it: 'should provide a function which always returns the given value',
      given: d => fp.always(5)(d),
      with: 1,
      expected: 5,
    },
    {
      it: 'should provide a function to extract a prop from an object',
      given: o => fp.prop('value')(o),
      with: { some: 'thing', value: 'five' },
      expected: 'five',
    },
    {
      it: 'should provide a function to instantiate a class',
      given: d => fp.instantiate(SayHello)(d),
      with: 'jean',
      expected: new SayHello('jean'),
    },
    {
      it: 'should instantiate a class with additional parameters if any',
      given: d => fp.instantiate(SayHello, 'other value')(d),
      with: 'jean',
      expected: new SayHello('jean', 'other value'),
    },
    {
      it: 'should provide a function to map on an array',
      given: d => fp.map(s => s.toUpperCase())(d),
      with: ['one', 'two', 'three'],
      expected: ['ONE', 'TWO', 'THREE'],
    },
    {
      it: 'should map on object values if given an object',
      given: d => fp.map(s => s.toUpperCase())(d),
      with: { a: 'one', b: 'two', c: 'three' },
      expected: { a: 'ONE', b: 'TWO', c: 'THREE' },
    },
    {
      it: 'should provide a function to reduce an array',
      given: d => fp.reduce((p, c) => {
        if (c > 5) {
          p.push(c);
        }
        return p;
      })(d),
      with: [1, 2, 3, 4, 5, 6, 7],
      expected: [6, 7],
    },
    {
      it: 'should reduce an object too',
      given: o => fp.reduce((p, c, key) => {
        if (c > 5) {
          return Object.assign(p, { [key]: c });
        }

        return p;
      })(o),
      with: { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7 },
      expected: { f: 6, g: 7 },
    },
    {
      it: 'should reduce with a given accumulator',
      given: d => fp.reduce((p, c) => Object.assign(p, { [c]: c }), {})(d),
      with: [1, 2, 3],
      expected: { 1: 1, 2: 2, 3: 3 },
    },
    {
      it: 'should provide a way to pipe functions',
      given: d => fp.pipe(fp.always('test'), s => s.toUpperCase())(d),
      with: 'something',
      expected: 'TEST',
    },
    {
      it: 'should provide a way to flatten an array',
      given: d => fp.flatten(d),
      with: [[1, 2], [3, 4]],
      expected: [1, 2, 3, 4],
    },
    {
      it: 'should flatten an object too',
      given: d => fp.flatten(d),
      with: { a: [1, 2], b: [3, 4]},
      expected: [1, 2, 3, 4],      
    },
    {
      it: 'should retrieve the first element of an array',
      given: d => fp.first(d),
      with: [1, 2, 3],
      expected: 1,
    },
    {
      it: 'should retrieve the last element of an array',
      given: d => fp.last(d),
      with: [1, 2, 3],
      expected: 3,
    },
    {
      it: 'should set arbitrary prop',
      given: d => fp.set(o => o.value = 'tata')(d),
      with: { value: 'toto' },
      expected: { value: 'tata' },
    },
    {
      it: 'should append to an array',
      given: d => fp.append(3, 4)(d),
      with: [1, 2],
      expected: [1, 2, 3, 4],
    },
    {
      it: 'should append to an object',
      given: d => fp.append({ some: 'value' }, { else: 'too' })(d),
      with: { an: 'object' },
      expected: { an: 'object', some: 'value', else: 'too' },
    },
  ];

  tests.forEach(test => {
    it (test.it, function () {
      expect(test.given(test.with)).to.deep.equal(test.expected);
    });
  });
});