from sure import expect
from pychatl import parse

class TestParser:

  def it_should_correctly_parse_dsl(self, it, dsl, expected):
    expect(parse(dsl)).to.equal(expected)

  def test_it_should_correctly_parse_dsl(self):
    tests = [
      {
        'it': 'should parse simple intents with props',
        'dsl': """
%[get_forecast](some=prop, something=else)
  will it rain in @[city]
  ~[greet] what's the weather like in @[city#variant]

%[lights_on]
  turn the lights on
  """,
        'expected': {
          'intents': {
            'get_forecast': {
              'props': { 'some': 'prop', 'something': 'else' },
              'data': [
                [
                  { 'type': 'text', 'value': 'will it rain in ' },
                  { 'type': 'entity', 'value': 'city', 'variant': None },
                ],
                [
                  { 'type': 'synonym', 'value': 'greet', 'optional': False },
                  { 'type': 'text', 'value': " what's the weather like in " },
                  { 'type': 'entity', 'value': 'city', 'variant': 'variant' },
                ],
              ],
            },
            'lights_on': {
              'props': {},
              'data': [
                [ { 'type': 'text', 'value': 'turn the lights on' } ],
              ],
            },
          },
          'entities': {},
          'synonyms': {},
          'comments': [],
        },
      },
      {
        'it': 'should parse empty entities',
        'dsl': """
@[room]
  kitchen
  bedroom

@[anotherRoom](type=room)
  """,
        'expected': {
          'intents': {},
          'entities': {
            'room': {
              'props': {},
              'variants': {},
              'data': [
                { 'type': 'text', 'value': 'kitchen' },
                { 'type': 'text', 'value': 'bedroom' },
              ],
            },
            'anotherRoom': {
              'props': { 'type': 'room' },
              'variants': {},
              'data': [],
            },
          },
          'synonyms': {},
          'comments': [],
        },
      },
      {
        'it': 'should parse entities',
        'dsl': """
@[city](some=prop, something=else)
  paris
  rouen
  ~[new york]
  """,
        'expected': {
          'intents': {},
          'synonyms': {},
          'entities': {
            'city': {
              'props': { 'some': 'prop', 'something': 'else' },
              'variants': {},
              'data': [
                { 'type': 'text', 'value': 'paris' },
                { 'type': 'text', 'value': 'rouen' },
                { 'type': 'synonym', 'value': 'new york' },
              ],
            },
          },
          'comments': [],
        },
      },
      {
        'it': 'should parse entity variants',
        'dsl': """
@[city](some=prop, something=else)
    paris
    rouen
    ~[new york]

@[city#variant](var=prop)
    one variant
    another one
  """,
        'expected': {
          'intents': {},
          'synonyms': {},
          'entities': {
            'city': {
              'props': { 'some': 'prop', 'something': 'else', 'var': 'prop' },
              'variants': {
                'variant': [
                  { 'type': 'text', 'value': 'one variant' },
                  { 'type': 'text', 'value': 'another one' },
                ],
              },
              'data': [
                { 'type': 'text', 'value': 'paris' },
                { 'type': 'text', 'value': 'rouen' },
                { 'type': 'synonym', 'value': 'new york' },
              ],
            },
          },
          'comments': [],
        },
      },
      {
        'it': 'should parse synonyms',
        'dsl': """
~[new york](some=prop, something=else)
  nyc
  the big apple
  """,
        'expected': {
          'intents': {},
          'entities': {},
          'synonyms': {
            'new york''': {
              'props': { 'some': 'prop', 'something': 'else' },
              'data': [
                { 'type': 'text', 'value': 'nyc' },
                { 'type': 'text', 'value': 'the big apple' },
              ],
            },
          },
          'comments': [],
        },
      },
      {
        'it': 'should allow optional synonyms in intents',
        'dsl': """
%[get_restaurant]
  ~[greet?] find me some restaurant near @[location]
  """,
        'expected': {
          'intents': {
            'get_restaurant': {
              'props': {},
              'data': [
                [
                  {
                    'type': 'synonym',
                    'value': 'greet',
                    'optional': True,
                  },
                  {
                    'type': 'text',
                    'value': ' find me some restaurant near ',
                  },
                  {
                    'type': 'entity',
                    'value': 'location',
                    'variant': None,
                  },
                ],
              ],
            },
          },
          'entities': {},
          'synonyms': {},
          'comments': [],
        },
      },
      {
        'it': 'should parse complex properties',
        'dsl': """
@[an entity](with complex=property value, and maybe=an0 ther @)
  a value
  """,
        'expected': {
          'intents': {},
          'synonyms': {},
          'entities': {
            'an entity''': {
              'props': {
                'with complex': 'property value',
                'and maybe': 'an0 ther @',
              },
              'variants': {},
              'data': [ { 'type': 'text', 'value': 'a value'} ],
            },
          },
          'comments': [],
        },
      },
      {
        'it': 'should parse property with back ticks',
        'dsl': """
@[zipcode](regex=`[0-9]{5}`, another=prop)
  27000
  76000
  """,
        'expected': {
          'intents': {},
          'synonyms': {},
          'entities': {
            'zipcode': {
              'props': {
                'regex': '[0-9]{5}',
                'another': 'prop',
              },
              'variants': {},
              'data': [
                { 'type': 'text', 'value': '27000' },
                { 'type': 'text', 'value': '76000' },
              ],
            },
          },
          'comments': [],
        },
      },
      {
        'it': 'should parse comments',
        'dsl': """
# chatl is really easy to understand.
#
# You can 'defines':
#   - Intents
#   - Entities (with or without variants)
#   - Synonyms
#   - Comments (only at the top level)
# Inside an intent, you got training data.
# Training data can refer to one or more entities and/or synonyms, they will be used
# by generators to generate all possible permutations and training samples.
%[my_intent]
  ~[greet] some training data @[date]
  another training data that uses an @[entity] at @[date#with_variant]

~[greet]
  hi
  hello

# Entities contains available samples and could refer to a synonym.
@[entity]
  some value
  other value
  ~[a synonym]

# Synonyms contains only raw values
~[a synonym]
  possible synonym
  another one

# Entities and intents can define arbitrary properties that will be made available
# to generators.
# For snips, type and extensible are used for example.
@[date](type=snips/datetime)
  tomorrow
  today

# Variants is used only to generate training sample with specific values that should
# maps to the same entity name, here date. Props will be merged with the root entity.
@[date#with_variant]
  the end of the day
  nine o clock
  twenty past five
  """,
        'expected': {
          'intents': {
            'my_intent': {
              'data': [
                [
                  { 'type': "synonym", 'value': "greet", 'optional': False },
                  { 'type': "text", 'value': " some training data " },
                  { 'type': "entity", 'value': "date", 'variant': None },
                ],
                [
                  { 'type': "text", 'value': "another training data that uses an " },
                  { 'type': "entity", 'value': "entity", 'variant': None },
                  { 'type': "text", 'value': " at " },
                  { 'type': "entity", 'value': "date", 'variant': "with_variant" },
                ],
              ],
              'props': {},
            },      
          },
          'entities': {
            'date': {
              'data': [
                { 'type': "text", 'value': "tomorrow" },
                { 'type': "text", 'value': "today" },
              ],
              'props': {
                'type': "snips/datetime"
              },
              'variants': {
                'with_variant': [
                  { 'type': "text", 'value': "the end of the day" },
                  { 'type': "text", 'value': "nine o clock" },
                  { 'type': "text", 'value': "twenty past five" },
                ],
              },
            },
            'entity': {
              'data': [
                { 'type': "text", 'value': "some value" },
                { 'type': "text", 'value': "other value" },
                { 'type': "synonym", 'value': "a synonym" },
              ],
              'props': {},
              'variants': {},
            },      
          },
          'synonyms': {
            'a synonym': {
              'data': [
                { 'type': "text", 'value': "possible synonym" },
                { 'type': "text", 'value': "another one" },
              ],
              'props': {},
            },
            'greet': {
              'data': [
                { 'type': "text", 'value': "hi" },
                { 'type': "text", 'value': "hello" },
              ],
              'props': {},
            },      
          },
          'comments': [
            { 'type': "comment", 'value': "chatl is really easy to understand." },
            { 'type': "comment", 'value': "" },
            { 'type': "comment", 'value': "You can 'defines':" },
            { 'type': "comment", 'value': "- Intents" },
            { 'type': "comment", 'value': "- Entities (with or without variants)" },
            { 'type': "comment", 'value': "- Synonyms" },
            { 'type': "comment", 'value': "- Comments (only at the top level)" },
            { 'type': "comment", 'value': "Inside an intent, you got training data." },
            { 'type': "comment", 'value': "Training data can refer to one or more entities and/or synonyms, they will be used" },
            { 'type': "comment", 'value': "by generators to generate all possible permutations and training samples." },
            { 'type': "comment", 'value': "Entities contains available samples and could refer to a synonym." },
            { 'type': "comment", 'value': "Synonyms contains only raw values" },
            { 'type': "comment", 'value': "Entities and intents can define arbitrary properties that will be made available" },
            { 'type': "comment", 'value': "to generators." },
            { 'type': "comment", 'value': "For snips, type and extensible are used for example." },
            { 'type': "comment", 'value': "Variants is used only to generate training sample with specific values that should" },
            { 'type': "comment", 'value': "maps to the same entity name, here date. Props will be merged with the root entity." },
          ],
        },
      },
    ]

    for test in tests:
      yield self.it_should_correctly_parse_dsl, test['it'], test['dsl'], test['expected']