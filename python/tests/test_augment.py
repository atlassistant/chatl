from sure import expect
from pychatl.augment import Augment
from pychatl.entity_value_provider import EntityValueProvider

class TestAugment:

  def it_should_permutate_data_in_intents(self, it, dataset, expected):
    augment = Augment(dataset)
    expect(augment.get_intents()).to.equal(expected)

  def test_it_should_permutate_data_in_intents(self):
    tests = [
      {
        'it': 'should do nothing if no synonym were found',
        'dataset': {
          'intents': {
            'hello': {
              'data': [ [ { 'type': 'text', 'value': 'hello there' } ] ],
            },
          },
          'synonyms': {},
        },
        'expected': {
          'hello': {
            'data': [ [ { 'type': 'text', 'value': 'hello there' } ] ],
          },
        },
      },
      {
        'it': 'should permutate when there is at least one synonym in the sentence',
        'dataset': {
          'intents': {
            'greetings': {
              'props': { 'a': 5 },
              'data': [
                [
                  { 'type': 'synonym', 'value': 'hey', 'optional': False },
                  { 'type': 'text', 'value': ' there, how are you?' },
                ],
                [
                  { 'type': 'text', 'value': 'nothing should change here' },
                ],
              ],
            }
          },
          'synonyms': {
            'hey': {
              'data': [
                { 'type': 'text', 'value': 'hello' },
                { 'type': 'text', 'value': 'hi' },
              ],
            },
          },
        },
        'expected': {
          'greetings': {
            'props': { 'a': 5 },
            'data': [
              [
                { 'type': 'text', 'value': 'hello' },
                { 'type': 'text', 'value': ' there, how are you?' },
              ],
              [
                { 'type': 'text', 'value': 'hi' },
                { 'type': 'text', 'value': ' there, how are you?' },
              ],
              [
                { 'type': 'text', 'value': 'nothing should change here' },
              ],
            ],
          }
        },
      },
      {
        'it': 'should permutate when there is more than one synonym in the sentence',
        'dataset': {
          'intents': {
            'sample': {
              'data': [
                [
                  { 'type': 'synonym', 'value': 'object', 'optional': False },
                  { 'type': 'text', 'value': ' is '},
                  { 'type': 'synonym', 'value': 'color' },
                ]
              ],
            },
          },
          'synonyms': {
            'object': {
              'data': [
                { 'type': 'text', 'value': 'car' },
                { 'type': 'text', 'value': 'flower' },
              ],
            },
            'color': {
              'data': [
                { 'type': 'text', 'value': 'green' },
                { 'type': 'text', 'value': 'red' },
              ],
            },
          },
        },
        'expected': {
          'sample': {
            'data': [
              [
                { 'type': 'text', 'value': 'car' },
                { 'type': 'text', 'value': ' is '},
                { 'type': 'text', 'value': 'green' },
              ],
              [
                { 'type': 'text', 'value': 'car' },
                { 'type': 'text', 'value': ' is '},
                { 'type': 'text', 'value': 'red' },
              ],
              [
                { 'type': 'text', 'value': 'flower' },
                { 'type': 'text', 'value': ' is '},
                { 'type': 'text', 'value': 'green' },
              ],
              [
                { 'type': 'text', 'value': 'flower' },
                { 'type': 'text', 'value': ' is '},
                { 'type': 'text', 'value': 'red' },
              ],
            ],
          },
        },
      },
      {
        'it': 'shoud permutate with optional synonyms too',
        'dataset': {
          'intents': {
            'sample': {
              'data': [
                [
                  { 'type': 'synonym', 'value': 'greet', 'optional': True },
                  { 'type': 'text', 'value': ' how are ' },
                  { 'type': 'synonym', 'value': 'you', 'optional': True },
                ]
              ],
            },
          },
          'synonyms': {
            'greet': {
              'data': [
                { 'type': 'text', 'value': 'hi' },
                { 'type': 'text', 'value': 'hey' },
              ],
            },
            'you': {
              'data': [
                { 'type': 'text', 'value': 'you' },
                { 'type': 'text', 'value': 'ya' },
              ],
            },
          },
        },
        'expected': {
          'sample': {
            'data': [
              [
                { 'type': 'text', 'value': 'how are' },
              ],
              [
                { 'type': 'text', 'value': 'how are ' },
                { 'type': 'text', 'value': 'you' },
              ],
              [
                { 'type': 'text', 'value': 'how are ' },
                { 'type': 'text', 'value': 'ya' },
              ],
              [
                { 'type': 'text', 'value': 'hi' },
                { 'type': 'text', 'value': ' how are' },
              ],
              [
                { 'type': 'text', 'value': 'hi' },
                { 'type': 'text', 'value': ' how are ' },
                { 'type': 'text', 'value': 'you' },
              ],
              [
                { 'type': 'text', 'value': 'hi' },
                { 'type': 'text', 'value': ' how are ' },
                { 'type': 'text', 'value': 'ya' },
              ],
              [
                { 'type': 'text', 'value': 'hey' },
                { 'type': 'text', 'value': ' how are' },
              ],
              [
                { 'type': 'text', 'value': 'hey' },
                { 'type': 'text', 'value': ' how are ' },
                { 'type': 'text', 'value': 'you' },
              ],
              [
                { 'type': 'text', 'value': 'hey' },
                { 'type': 'text', 'value': ' how are ' },
                { 'type': 'text', 'value': 'ya' },
              ],
            ],
          },
        },
      },
      {
        'it': 'should handle trailing whitespace correctly',
        'dataset': {
          'intents': {
            'sample': {
              'data': [
                [
                  { 'type': 'text', 'value': 'welcome ' },
                  { 'type': 'synonym', 'value': 'back', 'optional': True },
                  { 'type': 'text', 'value': ' ' },
                  { 'type': 'synonym', 'value': 'name', 'optional': True },
                ],
              ],
            },
          },
          'synonyms': {
            'back': {
              'data': [
                { 'type': 'text', 'value': 'back' },
              ],
            },
            'name': {
              'data': [
                { 'type': 'text', 'value': 'john' },
                { 'type': 'text', 'value': 'bob' },
              ],
            },
          },
        },
        'expected': {
          'sample': {
            'data': [
              [
                { 'type': 'text', 'value': 'welcome' },
              ],
              [
                { 'type': 'text', 'value': 'welcome' },
                { 'type': 'text', 'value': ' ' },
                { 'type': 'text', 'value': 'john' },
              ],
              [
                { 'type': 'text', 'value': 'welcome' },
                { 'type': 'text', 'value': ' ' },
                { 'type': 'text', 'value': 'bob' },
              ],
              [
                { 'type': 'text', 'value': 'welcome ' },
                { 'type': 'text', 'value': 'back' },
              ],
              [
                { 'type': 'text', 'value': 'welcome ' },
                { 'type': 'text', 'value': 'back' },
                { 'type': 'text', 'value': ' ' },
                { 'type': 'text', 'value': 'john' },
              ],
              [
                { 'type': 'text', 'value': 'welcome ' },
                { 'type': 'text', 'value': 'back' },
                { 'type': 'text', 'value': ' ' },
                { 'type': 'text', 'value': 'bob' },
              ],
            ],
          },
        },
      },
      {
        'it': 'should handle optional synonyms inside sentence too',
        'dataset': {
          'intents': {
            'sample': {
              'data': [
                [
                  { 'type': 'text', 'value': 'welcome ' },
                  { 'type': 'synonym', 'value': 'back', 'optional': True },
                  { 'type': 'text', 'value': ' ' },
                  { 'type': 'synonym', 'value': 'name', 'optional': True },
                  { 'type': 'text', 'value': ' in town' },
                ],
              ],
            },
          },
          'synonyms': {
            'back': {
              'data': [
                { 'type': 'text', 'value': 'back' },
              ],
            },
            'name': {
              'data': [
                { 'type': 'text', 'value': 'john' },
                { 'type': 'text', 'value': 'bob' },
              ],
            },
          },
        },
        'expected': {
          'sample': {
            'data': [
              [
                { 'type': 'text', 'value': 'welcome' },
                { 'type': 'text', 'value': ' in town' },
              ],
              [
                { 'type': 'text', 'value': 'welcome' },
                { 'type': 'text', 'value': ' ' },
                { 'type': 'text', 'value': 'john' },
                { 'type': 'text', 'value': ' in town' },
              ],
              [
                { 'type': 'text', 'value': 'welcome' },
                { 'type': 'text', 'value': ' ' },
                { 'type': 'text', 'value': 'bob' },
                { 'type': 'text', 'value': ' in town' },
              ],
              [
                { 'type': 'text', 'value': 'welcome ' },
                { 'type': 'text', 'value': 'back' },
                { 'type': 'text', 'value': ' in town' },
              ],
              [
                { 'type': 'text', 'value': 'welcome ' },
                { 'type': 'text', 'value': 'back' },
                { 'type': 'text', 'value': ' ' },
                { 'type': 'text', 'value': 'john' },
                { 'type': 'text', 'value': ' in town' },
              ],
              [
                { 'type': 'text', 'value': 'welcome ' },
                { 'type': 'text', 'value': 'back' },
                { 'type': 'text', 'value': ' ' },
                { 'type': 'text', 'value': 'bob' },
                { 'type': 'text', 'value': ' in town' },
              ],
            ],
          },
        },
      },
    ]

    for test in tests:
      yield self.it_should_permutate_data_in_intents, test['it'], test['dataset'], test['expected']

  def test_it_should_provide_a_way_to_retrieve_entity_value_provider(self):
    d = {
      'entities': {
        'city': {
          'variants': {
            'secondary': [
              { 'type': 'text', 'value': 'new york' },
            ],
          },
          'data': [
            { 'type': 'text', 'value': 'paris' },
            { 'type': 'text', 'value': 'rouen' },
          ],
        },
      },
    }
    augment = Augment(d)
    expect(augment.get_entity('city')).to.equal(EntityValueProvider(d['entities']['city']))

  def test_it_should_raise_an_error_when_trying_to_retrieve_an_invalid_entity(self):
    augment = Augment({})
    expect(lambda: augment.get_entity('some_entity')).to.throw(Exception, 'Could not find an entity with the name: some_entity')

  def test_it_should_retrieve_synonyms_for_an_entity(self):
    augment = Augment({
      'synonyms': {
        'new york': {
          'data': [
            { 'type': 'text', 'value': 'ny' },
            { 'type': 'text', 'value': 'nyc' },
          ],
        },
      },
    })

    expect(augment.get_synonyms('new york')).to.equal(['ny', 'nyc']);
    expect(augment.get_synonyms('room')).to.be.empty;

  def test_it_should_satisfy_the_use_synonyms_in_entity_value_provider_parameter(self):
    augment = Augment({
      'entities': {
        'city': {
          'props': {},
          'data': [
            { 'type': 'synonym', 'value': 'new york' },
          ],
        },
      },
      'synonyms': {
        'new york': {
          'data': [
            { 'type': 'text', 'value': 'ny' },
            { 'type': 'text', 'value': 'nyc' },
          ],
        },
      },
    }, True)

    expect(augment.get_entity('city').next()).to.equal('new york');
    expect(augment.get_entity('city').next()).to.equal('ny');
    expect(augment.get_entity('city').next()).to.equal('nyc');
    expect(augment.get_entity('city').next()).to.equal('new york');
    expect(augment.get_entity('city').all()).to.equal(['new york']);