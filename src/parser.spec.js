const chatl = require('./index');
const _ = require('lodash');
const expect = require('chai').expect;

describe('the pegjs parser', function () {
  it('parses intents correctly', function () {
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

  it('parses entities correctly', function () {
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
    expect(entity.data[2].value).to.equal('new york');
    expect(entity.data[2].type).to.equal('synonym');
  });

  it('parses entities variants correctly', function () {
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

    const variant = entity.variants.variant;

    expect(_.size(variant)).to.equal(2);

    expect(variant[0].type).to.equal('text');
    expect(variant[0].value).to.equal('one variant');
    expect(variant[1].type).to.equal('text');
    expect(variant[1].value).to.equal('another one');
  });

  it('parses synonyms correctly', function () {
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
});