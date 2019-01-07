const chatl = require('./../index');
const snips = chatl.adapters.snips;
const expect = require('chai').expect;
const _ = require('lodash');

describe('the snips adapter', function () {
  it('allow obsolete declaration of type for now', function() {
    const result = chatl.parse(`
@[date](snips:type=snips/datetime)
  tomorrow
`);

      dataset = snips(result);

      expect(dataset['entities']).to.include.key('snips/datetime');
      expect(dataset['entities']['snips/datetime']).to.be.empty
  });

  it ('process intents', function () {
    const result = chatl.parse(`
%[get_forecast]
  will it rain in @[city] on @[date]
  ~[greet] what's the weather like in @[city#variant]

@[city]
  paris
  rouen

@[city#variant]
  new york
  los angeles

@[date](type=datetime)
  tomorrow

~[greet]
  hi
  hello
`);

    const dataset = snips(result);

    expect(_.size(dataset.intents)).to.equal(1);
    expect(dataset.intents).to.include.key('get_forecast');

    intent = dataset.intents.get_forecast;

    expect(intent).to.include.key('utterances');

    utterances = intent.utterances;

    expect(_.size(utterances)).to.equal(3);

    data = utterances[0]['data'];

    expect(_.size(data)).to.equal(4);
    expect(data[0]['text']).to.equal('will it rain in ');
    expect(data[1]['text']).to.equal('paris');
    expect(data[1]['slot_name']).to.equal('city');
    expect(data[1]['entity']).to.equal('city');
    expect(data[2]['text']).to.equal(' on ');
    expect(data[3]['text']).to.equal('tomorrow');
    expect(data[3]['slot_name']).to.equal('date');
    expect(data[3]['entity']).to.equal('snips/datetime');

    data = utterances[1]['data'];

    expect(_.size(data)).to.equal(3);
    expect(data[0]['text']).to.equal('hi');
    expect(data[1]['text']).to.equal(" what's the weather like in ");
    expect(data[2]['text']).to.equal('new york');
    expect(data[2]['slot_name']).to.equal('city');
    expect(data[2]['entity']).to.equal('city');

    data = utterances[2]['data'];

    expect(_.size(data)).to.equal(3);
    expect(data[0]['text']).to.equal('hello');
    expect(data[1]['text']).to.equal(" what's the weather like in ");
    expect(data[2]['text']).to.equal('los angeles');
    expect(data[2]['slot_name']).to.equal('city');
    expect(data[2]['entity']).to.equal('city');
  });

  it('process empty entities which refer to another one', function () {
    const result = chatl.parse(`
%[my_intent]
  we should go from @[room] to @[anotherRoom]

@[room]
  kitchen
  bedroom

@[anotherRoom](type=room)
`)
    const dataset = snips(result);

    expect(_.size(dataset['entities'])).to.equal(1);
    expect(dataset['entities']).to.include.key('room');

    expect(_.size(dataset['intents'])).to.equal(1);
    expect(dataset['intents']).to.include.key('my_intent');

    intent = dataset['intents']['my_intent'];

    expect(intent).to.include.key('utterances');

    utterances = intent['utterances'];

    expect(_.size(utterances)).to.equal(1);

    data = utterances[0]['data'];

    expect(_.size(data)).to.equal(4);
    expect(data[0]['text']).to.equal('we should go from ');
    expect(data[1]['slot_name']).to.equal('room');
    expect(data[1]['entity']).to.equal('room');
    expect(data[1]['text']).to.equal('kitchen');
    expect(data[2]['text']).to.equal(' to ');
    expect(data[3]['slot_name']).to.equal('anotherRoom');
    expect(data[3]['entity']).to.equal('room');
    expect(data[3]['text']).to.equal('bedroom');
  });

  it('process entities', function() {
    const result = chatl.parse(`
@[city]
  paris
  rouen
  ~[new york]

@[room](extensible=false, strictness=0.8)
  kitchen
  bedroom

@[date](type=datetime)
  tomorrow
  on tuesday

~[new york]
  nyc
  the big apple
`)
    const dataset = snips(result);

    expect(_.size(dataset['entities'])).to.equal(3);
    expect(dataset['entities']).to.include.key('city');

    entity = dataset['entities']['city'];

    expect(entity['use_synonyms']).to.be.true;
    expect(entity['automatically_extensible']).to.be.true;
    expect(entity['matching_strictness']).to.equal(1.0);

    expect(_.size(entity['data'])).to.equal(3);
    expect(entity['data'][0]['value']).to.equal('paris');
    expect(entity['data'][1]['value']).to.equal('rouen');
    expect(entity['data'][2]['value']).to.equal('new york');
    expect(_.size(entity['data'][2]['synonyms'])).to.equal(2);
    expect(entity['data'][2]['synonyms']).to.deep.equal(['nyc', 'the big apple']);

    expect(dataset['entities']).to.include.key('room');

    entity = dataset['entities']['room'];

    expect(entity['use_synonyms']).to.be.false;
    expect(entity['automatically_extensible']).to.be.false;
    expect(entity['matching_strictness']).to.equal(0.8);

    expect(_.size(entity['data'])).to.equal(2);
    expect(dataset['entities']).to.not.include.key('date');
    expect(dataset['entities']).to.include.key('snips/datetime');

    expect(dataset['entities']['snips/datetime']).to.be.empty;
  });

  it('process entities with variants', function() {
    const result = chatl.parse(`
@[city]
  paris
  rouen
  ~[new york]

@[city#variant]
  one variant
  another one

~[new york]
  nyc
  the big apple
`)
    const dataset = snips(result);

    expect(_.size(dataset['entities'])).to.equal(1);
    expect(dataset['entities']).to.include.key('city');

    entity = dataset['entities']['city'];

    expect(_.size(entity['data'])).to.equal(5);
    expect(entity['use_synonyms']).to.be.true;
    expect(entity['automatically_extensible']).to.be.true;
    expect(_.size(entity['data'][2]['synonyms'])).to.equal(2);
    expect(entity['data'][2]['synonyms']).to.deep.equal(['nyc', 'the big apple']);

    data = entity['data'].map(o => o['value']);

    expect(data).to.deep.equal(['paris', 'rouen', 'new york', 'one variant', 'another one']);
  });

  it('process options', function() {
    const result = chatl.parse(`
@[city]
  paris
  rouen
`)
    let dataset = snips(result);

    expect(dataset['language']).to.equal('en');

    dataset = snips(result, { language: 'fr' });

    expect(dataset['language']).to.equal('fr');
  });
});