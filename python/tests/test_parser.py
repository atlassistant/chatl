from sure import expect
from pychatl import parse


class TestParser:

    def it_should_correctly_parse_dsl(self, it, dsl, expected):
        expect(parse(dsl)).to.equal(expected)

    def test_it_should_correctly_parse_dsl(self):
        tests = [
            {
                'it': 'should parse content with carriage return',
                'dsl': """%[lights_on]\r\n  turn the lights on\r\n%[lights_off]\r\n  turn the lights off""",
                'expected': {
                    'intents': {
                        'lights_on': {
                            'props': {},
                            'data': [
                                [{'type': 'text', 'value': 'turn the lights on'}],
                            ],
                        },
                        'lights_off': {
                            'props': {},
                            'data': [
                                [{'type': 'text', 'value': 'turn the lights off'}],
                            ],
                        },
                    },
                    'entities': {},
                    'synonyms': {},
                    'comments': [],
                },
            },
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
                            'props': {'some': 'prop', 'something': 'else'},
                            'data': [
                                [
                                    {'type': 'text', 'value': 'will it rain in '},
                                    {'type': 'entity', 'value': 'city',
                                     'variant': None},
                                ],
                                [
                                    {'type': 'synonym', 'value': 'greet',
                                     'optional': False},
                                    {'type': 'text',
                                     'value': " what's the weather like in "},
                                    {'type': 'entity', 'value': 'city',
                                     'variant': 'variant'},
                                ],
                            ],
                        },
                        'lights_on': {
                            'props': {},
                            'data': [
                                [{'type': 'text', 'value': 'turn the lights on'}],
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
                                {'type': 'text', 'value': 'kitchen'},
                                {'type': 'text', 'value': 'bedroom'},
                            ],
                        },
                        'anotherRoom': {
                            'props': {'type': 'room'},
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
                            'props': {'some': 'prop', 'something': 'else'},
                            'variants': {},
                            'data': [
                                {'type': 'text', 'value': 'paris'},
                                {'type': 'text', 'value': 'rouen'},
                                {'type': 'synonym', 'value': 'new york'},
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
                            'props': {'some': 'prop', 'something': 'else', 'var': 'prop'},
                            'variants': {
                                'variant': [
                                    {'type': 'text', 'value': 'one variant'},
                                    {'type': 'text', 'value': 'another one'},
                                ],
                            },
                            'data': [
                                {'type': 'text', 'value': 'paris'},
                                {'type': 'text', 'value': 'rouen'},
                                {'type': 'synonym', 'value': 'new york'},
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
                            'props': {'some': 'prop', 'something': 'else'},
                            'data': [
                                {'type': 'text', 'value': 'nyc'},
                                {'type': 'text', 'value': 'the big apple'},
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
                            'data': [{'type': 'text', 'value': 'a value'}],
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
                                {'type': 'text', 'value': '27000'},
                                {'type': 'text', 'value': '76000'},
                            ],
                        },
                    },
                    'comments': [],
                },
            },
            {
                'it': 'should parse comments',
                'dsl': """
# The chatl syntax is easy to understand.
# With the `%` symbol, you define intents. Intent data can contains entity references
# with the `@` and optional (using `?` as a suffix) synonyms with `~`.
# Synonyms here will be used to generate variations of the given sentence.
%[get_weather]
  ~[greet?] what's the weather like in @[city] @[date]
  ~[greet] will it rain in @[city] at @[date#hour]

# With the `~`, you define synonyms used in intents and entities definitions.
~[greet]
  hi
  hey

~[new york]
  ny
  nyc
  the big apple

# With the `@`, you define entities.
@[city]
  paris
  rouen
  ~[new york]

# You can define properties on intents, entities and synonyms.
# Depending on the dataset you want to generate, some props may be used
# by the adapter to convey specific meanings.
@[date](type=datetime, another=`property backticked`)
  tomorrow
  this weekend
  this evening

# You can define entity variants with the `#` symbol. Variants will be merge with
# the entity it references but is used to provide different values when
# generating intent sentences.
@[date#hour]
  ten o'clock
  noon
  """,
                'expected': {
                    "intents": {
                        "get_weather": {
                            "props": {},
                            "data": [
                                [
                                    {"type": "synonym", "value": "greet",
                                     "optional": True},
                                    {"type": "text",
                                     "value": " what's the weather like in "},
                                    {"type": "entity", "value": "city",
                                     "variant": None},
                                    {"type": "text", "value": " "},
                                    {"type": "entity", "value": "date",
                                     "variant": None},
                                ],
                                [
                                    {"type": "synonym", "value": "greet",
                                     "optional": False},
                                    {"type": "text", "value": " will it rain in "},
                                    {"type": "entity", "value": "city",
                                     "variant": None},
                                    {"type": "text", "value": " at "},
                                    {"type": "entity", "value": "date",
                                     "variant": "hour"},
                                ],
                            ],
                        },
                    },
                    "entities": {
                        "city": {
                            "variants": {},
                            "props": {},
                            "data": [
                                {"type": "text", "value": "paris"},
                                {"type": "text", "value": "rouen"},
                                {"type": "synonym", "value": "new york"},
                            ],
                        },
                        "date": {
                            "variants": {
                                "hour": [
                                    {"type": "text", "value": "ten o'clock"},
                                    {"type": "text", "value": "noon"},
                                ],
                            },
                            "props": {
                                "type": "datetime",
                                "another": "property backticked"
                            },
                            "data": [
                                {"type": "text", "value": "tomorrow"},
                                {"type": "text", "value": "this weekend"},
                                {"type": "text", "value": "this evening"},
                            ],
                        },
                    },
                    "synonyms": {
                        "greet": {
                            "props": {},
                            "data": [
                                {"type": "text", "value": "hi"},
                                {"type": "text", "value": "hey"},
                            ],
                        },
                        "new york": {
                            "props": {},
                            "data": [
                                {"type": "text", "value": "ny"},
                                {"type": "text", "value": "nyc"},
                                {"type": "text", "value": "the big apple"},
                            ],
                        },
                    },
                    "comments": [
                        {"type": "comment",
                         "value": "The chatl syntax is easy to understand."},
                        {"type": "comment", "value": "With the `%` symbol, you define intents. Intent data can contains entity references"},
                        {"type": "comment",
                         "value": "with the `@` and optional (using `?` as a suffix) synonyms with `~`."},
                        {"type": "comment", "value": "Synonyms here will be used to generate variations of the given sentence."},
                        {"type": "comment", "value": "With the `~`, you define synonyms used in intents and entities definitions."},
                        {"type": "comment", "value": "With the `@`, you define entities."},
                        {"type": "comment",
                         "value": "You can define properties on intents, entities and synonyms."},
                        {"type": "comment", "value": "Depending on the dataset you want to generate, some props may be used"},
                        {"type": "comment",
                         "value": "by the adapter to convey specific meanings."},
                        {"type": "comment", "value": "You can define entity variants with the `#` symbol. Variants will be merge with"},
                        {"type": "comment", "value": "the entity it references but is used to provide different values when"},
                        {"type": "comment", "value": "generating intent sentences."},
                    ],
                },
            },
        ]

        for test in tests:
            yield self.it_should_correctly_parse_dsl, test['it'], test['dsl'], test['expected']
