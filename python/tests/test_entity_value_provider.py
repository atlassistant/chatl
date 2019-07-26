from sure import expect
from pychatl.entity_value_provider import EntityValueProvider

class TestEntityValueProvider:

  def test_it_should_correctly_compare_with_other_instances(self):
    d = {
      'variants': {},
      'data': [
        { 'type': 'text', 'value': 'paris' },
        { 'type': 'synonym', 'value': 'new york' },
        { 'type': 'text', 'value': 'london' },
      ],
    }
    expect(EntityValueProvider(d)).to_not.equal(5)
    expect(EntityValueProvider(d)).to_not.equal(EntityValueProvider({}))
    expect(EntityValueProvider(d)).to_not.equal(EntityValueProvider(d, { 'new york': ['ny', 'nyc'] }))
    expect(EntityValueProvider(d)).to.equal(EntityValueProvider(d))

  def it_should_correctly_provide_values(self, it, entity, variant, synonyms, expected):
    provider = EntityValueProvider(entity, synonyms);

    for expectation in expected:
      expect(provider.next(variant)).to.equal(expectation)

  def test_it_should_correctly_provide_values(self):
    tests = [
      {
        'it': 'should provide different values each time and loop as needed',
        'entity': {
          'variants': {},
          'data': [
            { 'type': 'text', 'value': 'paris' },
            { 'type': 'synonym', 'value': 'new york' },
            { 'type': 'text', 'value': 'london' },
          ],
        },
        'variant': None,
        'synonyms': {},
        'expected': ['paris', 'new york', 'london', 'paris'],
      },
      {
        'it': 'should provide different variant values each time and loop as needed',
        'entity': {
          'variants': {
            'secondary': [
              { 'type': 'text', 'value': 'bedroom' },
              { 'type': 'text', 'value': 'bathroom' },
            ],
          },
          'data': [
            { 'type': 'text', 'value': 'kitchen' },
          ],
        },
        'variant': 'secondary',
        'synonyms': {},
        'expected': ['bedroom', 'bathroom', 'bedroom'],
      },
      {
        'it': 'should also provides synonyms when given at instantiation',
        'entity': {
          'variants': {},
          'data': [
            { 'type': 'synonym', 'value': 'kitchen' },
            { 'type': 'synonym', 'value': 'main room' },
          ],
        },
        'variant': None,
        'synonyms': {
          'kitchen''': ['cooking room'],
          'main room''': ['living room'],
        },
        'expected': ['kitchen', 'cooking room', 'main room', 'living room', 'kitchen'],
      },
      {
        'it': 'should also provides variants synonyms when given at instantiation',
        'entity': {
          'variants': {
            'secondary': [
              { 'type': 'synonym', 'value': 'bedroom' },
              { 'type': 'text', 'value': 'bathroom' },
            ],
          },
          'data': [
            { 'type': 'text', 'value': 'kitchen' },
          ],
        },
        'variant': 'secondary',
        'synonyms': {
          'bedroom''': ['rest room', 'best room'],
        },
        'expected': ['bedroom', 'rest room', 'best room', 'bathroom', 'bedroom'],
      },
    ]

    for test in tests:
      yield self.it_should_correctly_provide_values, test['it'], test['entity'], test['variant'], test['synonyms'], test['expected']

  def test_it_should_extract_variants_indices_and_values(self):
    p = EntityValueProvider({
      'variants': {
        'secondary': [ { 'type': 'text', 'value': 'a variant' } ]
      },
      'data': [],
    });

    expect(p.indices).to.equal({
      '_': -1,
      'secondary': -1,
    });

    expect(p.data).to.equal({
      '_': [],
      'secondary': ['a variant'],
    });

  def test_it_should_provide_a_way_to_retrieve_all_valid_entity_values(self):
    provider = EntityValueProvider({
      'variants': {
        'secondary': [
          { 'type': 'text', 'value': 'bedroom' },
          { 'type': 'text', 'value': 'bathroom' },
        ],
      },
      'data': [
        { 'type': 'text', 'value': 'kitchen' },
        { 'type': 'synonym', 'value': 'basement' },
      ],
    });

    expect(provider.all()).to.equal([
      'kitchen',
      'basement',
      'bedroom',
      'bathroom',
    ]);