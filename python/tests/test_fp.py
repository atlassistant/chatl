from sure import expect
from pychatl import fp

class SayHello:
  def __init__(self, name, other_prop=''):
    self.name = name
    self.other_prop = other_prop

  def __eq__(self, other):
    return self.name == other.name and self.other_prop == other.other_prop

class TestFP:
  
  def it_should_correctly_transform_data(self, it, given, data, expected):
    expect(given(data)).to.equal(expected)

  def test_it_should_correctly_transform_data(self):
    tests = [
      {
        'it': 'should provide a function which always returns the given value',
        'given': lambda d: fp.always(5)(d),
        'with': 1,
        'expected': 5,
      },
      {
        'it': 'should provide a function to extract a prop from an object',
        'given': lambda o: fp.prop('value')(o),
        'with': { 'some': 'thing', 'value': 'five' },
        'expected': 'five',
      },
      {
        'it': 'should provide a function to instantiate a class',
        'given': lambda d: fp.instantiate(SayHello)(d),
        'with': 'jean',
        'expected': SayHello('jean'),
      },
      {
        'it': 'should instantiate a class with additional parameters if any',
        'given': lambda d: fp.instantiate(SayHello, 'other value')(d),
        'with': 'jean',
        'expected': SayHello('jean', 'other value'),
      },
      {
        'it': 'should provide a function to map on an array',
        'given': lambda d: fp.map(lambda s: s.upper())(d),
        'with': ['one', 'two', 'three'],
        'expected': ['ONE', 'TWO', 'THREE'],
      },
      {
        'it': 'should map on object values if given an object',
        'given': lambda d: fp.map(lambda s: s.upper())(d),
        'with': { 'a': 'one', 'b': 'two', 'c': 'three' },
        'expected': { 'a': 'ONE', 'b': 'TWO', 'c': 'THREE' },
      },
      {
        'it': 'should provide a function to reduce an array',
        'given': lambda d: fp.reduce(lambda p, c: (p.append(c) or p) if c > 5 else p)(d),
        'with': [1, 2, 3, 4, 5, 6, 7],
        'expected': [6, 7],
      },
      {
        'it': 'should reduce an object too',
        'given': lambda o: fp.reduce(lambda p, c, key: (p.update({
          key: c,
        }) or p) if c > 5 else p)(o),
        'with': { 'a': 1, 'b': 2, 'c': 3, 'd': 4, 'e': 5, 'f': 6, 'g': 7 },
        'expected': { 'f': 6, 'g': 7 },
      },
      {
        'it': 'should reduce with a given accumulator',
        'given': lambda d: fp.reduce(lambda p, c: p.update({ c: c }) or p, {})(d),
        'with': [1, 2, 3],
        'expected': { 1: 1, 2: 2, 3: 3 },
      },
      {
        'it': 'should provide a way to pipe functions',
        'given': lambda d: fp.pipe(fp.always('test'), lambda s: s.upper())(d),
        'with': 'something',
        'expected': 'TEST',
      },
      {
        'it': 'should provide a way to flatten an array',
        'given': lambda d: fp.flatten(d),
        'with': [[1, 2], [3, 4]],
        'expected': [1, 2, 3, 4],
      },
      {
        'it': 'should flatten an object too',
        'given': lambda d: fp.flatten(d),
        'with': { 'a': [1, 2], 'b': [3, 4]},
        'expected': [1, 2, 3, 4],
      },
      {
        'it': 'should append to an array',
        'given': lambda d: fp.append(3, 4)(d),
        'with': [1, 2],
        'expected': [1, 2, 3, 4],
      },
      {
        'it': 'should append to an object',
        'given': lambda d: fp.append({ 'some': 'value' }, { 'else': 'too' })(d),
        'with': { 'an': 'object' },
        'expected': { 'an': 'object', 'some': 'value', 'else': 'too' },
      },
      {
        'it': 'should filter array elements',
        'given': lambda d: fp.filter(lambda a: (a % 2) == 0)(d),
        'with': [1, 2, 3, 4],
        'expected': [2, 4],
      },
      {
        'it': 'should clone an object',
        'given': lambda o: fp.clone(o),
        'with': { 'an': 'object', 'with': { 'nested': 'prop' } },
        'expected': { 'an': 'object', 'with': { 'nested': 'prop' } },
      },
    ]

    for test in tests:
      yield self.it_should_correctly_transform_data, test['it'], test['given'], test['with'], test['expected']