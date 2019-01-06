from sure import expect
from pychatl import parse

class TestParser:
  
  def test_it_should_parse_intents(self):
    result = parse("""
%[get_forecast](some=prop, something=else)
  will it rain in @[city]
  ~[greet] what's the weather like in @[city#variant]
""")

    expect(result['intents']).to.have.length_of(1)
    expect(result['intents']).to.have.key('get_forecast')

    intent = result['intents']['get_forecast']

    expect(intent['props']).to.have.length_of(2)
    expect(intent['props']).to.have.key('some')
    expect(intent['props']).to.have.key('something')
    expect(intent['props']['some']).to.equal('prop')
    expect(intent['props']['something']).to.equal('else')

    expect(intent['data']).to.have.length_of(2)

    data = intent['data'][0]

    expect(data).to.have.length_of(2)

    expect(data[0]['type']).to.equal('text')
    expect(data[0]['value']).to.equal('will it rain in ')
    expect(data[1]['type']).to.equal('entity')
    expect(data[1]['value']).to.equal('city')
    expect(data[1]['variant']).to.be.none

    data = intent['data'][1]

    expect(data).to.have.length_of(3)

    expect(data[0]['type']).to.equal('synonym')
    expect(data[0]['value']).to.equal('greet')
    expect(data[1]['type']).to.equal('text')
    expect(data[1]['value']).to.equal(" what's the weather like in ")
    expect(data[2]['type']).to.equal('entity')
    expect(data[2]['value']).to.equal('city')
    expect(data[2]['variant']).to.equal('variant')
  
  def test_it_should_parse_empty_entities(self):
    result = parse("""
@[room]
  kitchen
  bedroom

@[anotherRoom](type=room)
""")

    expect(result['entities']).to.have.length_of(2)
    expect(result['entities']).to.have.key('room')
    expect(result['entities']).to.have.key('anotherRoom')

    expect(result['entities']['anotherRoom']['props']).to.have.key('type')
    expect(result['entities']['anotherRoom']['props']['type']).to.equal('room')
    expect(result['entities']['anotherRoom']['data']).to.be.empty

  def test_it_should_parse_entities(self):
    result = parse("""
@[city](some=prop, something=else)
  paris
  rouen
  ~[new york]
""")

    expect(result['entities']).to.have.length_of(1)
    expect(result['entities']).to.have.key('city')
    
    entity = result['entities']['city']

    expect(entity['props']).to.have.length_of(2)
    expect(entity['props']).to.have.key('some')
    expect(entity['props']).to.have.key('something')
    expect(entity['props']['some']).to.equal('prop')
    expect(entity['props']['something']).to.equal('else')

    data = entity['data']

    expect(data).to.have.length_of(3)

    expect(data[0]['type']).to.equal('text')
    expect(data[0]['value']).to.equal('paris')
    expect(data[1]['type']).to.equal('text')
    expect(data[1]['value']).to.equal('rouen')
    expect(data[2]['type']).to.equal('synonym')
    expect(data[2]['value']).to.equal('new york')

  def test_it_should_parse_entities_variants(self):
    result = parse("""
@[city](some=prop, something=else)
  paris
  rouen
  ~[new york]

@[city#variant](var=prop)
  one variant
  another one
""")

    expect(result['entities']).to.have.length_of(1)

    entity = result['entities']['city']

    expect(entity['variants']).to.have.length_of(1)
    expect(entity['variants']).to.have.key('variant')

    expect(entity['props']).to.have.length_of(3)
    expect(entity['props']).to.have.key('some')
    expect(entity['props']).to.have.key('something')
    expect(entity['props']).to.have.key('var')
    expect(entity['props']['some']).to.equal('prop')
    expect(entity['props']['something']).to.equal('else')
    expect(entity['props']['var']).to.equal('prop')
    
    variant = entity['variants']['variant']

    expect(variant).to.have.length_of(2)

    expect(variant[0]['type']).to.equal('text')
    expect(variant[0]['value']).to.equal('one variant')
    expect(variant[1]['type']).to.equal('text')
    expect(variant[1]['value']).to.equal('another one')
  
  def test_it_should_parse_synonyms(self):
    result = parse("""
~[new york](some=prop, something=else)
  nyc
  the big apple""")

    expect(result['synonyms']).to.have.length_of(1)
    expect(result['synonyms']).to.have.key('new york')

    synonym = result['synonyms']['new york']

    expect(synonym['props']).to.have.length_of(2)
    expect(synonym['props']).to.have.key('some')
    expect(synonym['props']).to.have.key('something')
    expect(synonym['props']['some']).to.equal('prop')
    expect(synonym['props']['something']).to.equal('else')

    expect(synonym['data']).to.have.length_of(2)

    data = synonym['data']

    expect(data[0]['type']).to.equal('text')
    expect(data[0]['value']).to.equal('nyc')
    expect(data[1]['type']).to.equal('text')
    expect(data[1]['value']).to.equal('the big apple')
  
  def test_it_should_parse_complex_properties(self):
    result = parse("""
@[an entity](with complex=property value, and:maybe=an0 ther @)
  a value
""")

    expect(result['entities']).to.have.length_of(1)
    expect(result['entities']).to.have.key('an entity')

    entity = result['entities']['an entity']

    expect(entity['props']).to.have.length_of(2)
    expect(entity['props']).to.have.key('with complex')
    expect(entity['props']).to.have.key('and:maybe')
    expect(entity['props']['with complex']).to.equal('property value')
    expect(entity['props']['and:maybe']).to.equal('an0 ther @')

  def test_it_should_parse_comments(self):
    result = parse("""
# chatl is really easy to understand.
#
# You can defines:
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
# For snips, `type` and `extensible` are used for example.

@[date](type=snips/datetime)
  tomorrow
  today

# Variants is used only to generate training sample with specific values that should
# maps to the same entity name, here `date`. Props will be merged with the root entity.

@[date#with_variant]
  the end of the day
  nine o clock
  twenty past five
""")

    expect(result['intents']).to.have.length_of(1)
    expect(result['entities']).to.have.length_of(2)
    expect(result['synonyms']).to.have.length_of(2)