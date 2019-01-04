const chatl = require('./index');
const _ = require('lodash');
const expect = require('chai').expect;

describe('the pegjs parser', function () {

  it('parses intents', function () {
    const result = chatl.parse(`
%[get_forecast](some=prop, something=else)
    will it rain in @[city]
    ~[greet] what's the weather like in @[city#variant]
`);

    expect(_.size(result.intents)).to.equal(1);
    expect(result.intents).to.include.key('get_forecast');

    const intent = result.intents.get_forecast;

    expect(_.size(intent.props)).to.equal(2);
    expect(intent.props).to.include.keys('some', 'something');
    expect(intent.props.some).to.equal('prop');
    expect(intent.props.something).to.equal('else');

    expect(_.size(intent.data)).to.equal(2);

    let data = intent.data[0];

    expect(_.size(data)).to.equal(2);
    expect(data[0].type).to.equal('text');
    expect(data[0].value).to.equal('will it rain in ');
    expect(data[1].type).to.equal('entity');
    expect(data[1].value).to.equal('city');
    expect(data[1].variant).to.be.a('null');

    data = intent.data[1];

    expect(_.size(data)).to.equal(3);
    expect(data[0].type).to.equal('synonym');
    expect(data[0].value).to.equal('greet');
    expect(data[1].type).to.equal('text');
    expect(data[1].value).to.equal(" what's the weather like in ");
    expect(data[2].type).to.equal('entity');
    expect(data[2].value).to.equal('city');
    expect(data[2].variant).to.equal('variant');
  });

  it('parses empty entities', function () {
    const result = chatl.parse(`
@[room]
  kitchen
  bedroom

@[anotherRoom](type=room)
`);

    expect(_.size(result.entities)).to.equal(2);
    expect(result.entities).to.include.keys('room', 'anotherRoom')

    expect(result.entities.anotherRoom.props).to.include.key('type')
    expect(result.entities.anotherRoom.props.type).to.equal('room')
    expect(result.entities.anotherRoom.data).to.be.empty
  });

  it('parses entities', function () {
    const result = chatl.parse(`
@[city](some=prop, something=else)
    paris
    rouen
    ~[new york]
`);

    expect(_.size(result.entities)).to.equal(1);
    expect(result.entities).to.include.key('city');

    const entity = result.entities.city;

    expect(_.size(entity.props)).to.equal(2);
    expect(entity.props).to.include.keys('some', 'something');
    expect(entity.props.some).to.equal('prop');
    expect(entity.props.something).to.equal('else');

    expect(_.size(entity.data)).to.equal(3);
    expect(entity.data[0].value).to.equal('paris');
    expect(entity.data[0].type).to.equal('text');
    expect(entity.data[1].value).to.equal('rouen');
    expect(entity.data[1].type).to.equal('text');
    expect(entity.data[2].type).to.equal('synonym');
    expect(entity.data[2].value).to.equal('new york');
  });

  it('parses entities variants', function () {
    const result = chatl.parse(`
@[city](some=prop, something=else)
    paris
    rouen
    ~[new york]

@[city#variant](var=prop)
    one variant
    another one
`);

    expect(_.size(result.entities)).to.equal(1);
    
    const entity = result.entities.city;

    expect(_.size(entity.variants)).to.equal(1);
    expect(entity.variants).to.include.key('variant');
    expect(_.size(entity.props)).to.equal(3);
    expect(entity.props).to.include.keys('some', 'something', 'var');
    expect(entity.props.some).to.equal('prop');
    expect(entity.props.something).to.equal('else');
    expect(entity.props.var).to.equal('prop');

    const variant = entity.variants.variant;

    expect(_.size(variant)).to.equal(2);

    expect(variant[0].type).to.equal('text');
    expect(variant[0].value).to.equal('one variant');
    expect(variant[1].type).to.equal('text');
    expect(variant[1].value).to.equal('another one');
  });

  it('parses synonyms', function () {
    const result = chatl.parse(`
~[new york](some=prop, something=else)
    nyc
    the big apple
`);

    expect(_.size(result.synonyms)).to.equal(1);
    expect(result.synonyms).to.include.key('new york');

    const synonym = result.synonyms['new york'];

    expect(_.size(synonym.props)).to.equal(2);
    expect(synonym.props).to.include.keys('some', 'something');
    expect(synonym.props.some).to.equal('prop');
    expect(synonym.props.something).to.equal('else');

    expect(_.size(synonym.data)).to.equal(2);
    expect(synonym.data[0].value).to.equal('nyc');
    expect(synonym.data[0].type).to.equal('text');
    expect(synonym.data[1].value).to.equal('the big apple');
    expect(synonym.data[1].type).to.equal('text');
  });

  it('parses complex properties', function() {
    const result = chatl.parse(`
@[an entity](with complex=property value, and:maybe=an0 ther @)
  a value
`);

    expect(_.size(result.entities)).to.equal(1);
    expect(result.entities).to.include.key('an entity');

    entity = result.entities['an entity'];

    expect(_.size(entity.props)).to.equal(2)
    expect(entity.props).to.include.keys('with complex', 'and:maybe')
    expect(entity.props['with complex']).to.equal('property value')
    expect(entity.props['and:maybe']).to.equal('an0 ther @')
  });

  it('parses comments', function () {
    const result = chatl.parse(`
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
`);

    expect(_.size(result.intents)).to.equal(1);
    expect(_.size(result.entities)).to.equal(2);
    expect(_.size(result.synonyms)).to.equal(2);
  });
});