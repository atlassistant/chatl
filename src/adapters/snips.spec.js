const chatl = require('./../index');
const snips = chatl.adapters.snips;
const expect = require('chai').expect;
const _ = require('lodash');

describe('the snips adapter', function () {
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

    expect(data).to.have.length_of(3);
    expect(data[0]['text']).to.equal('hi');
    expect(data[1]['text']).to.equal(" what's the weather like in ");
    expect(data[2]['text']).to.equal('new york');
    expect(data[2]['slot_name']).to.equal('city');
    expect(data[2]['entity']).to.equal('city');

    data = utterances[2]['data'];

    expect(data).to.have.length_of(3);
    expect(data[0]['text']).to.equal('hello');
    expect(data[1]['text']).to.equal(" what's the weather like in ");
    expect(data[2]['text']).to.equal('los angeles');
    expect(data[2]['slot_name']).to.equal('city');
    expect(data[2]['entity']).to.equal('city');
  });

  it('process empty entities which refer to another one', function () {
    this.skip();
  });

  it('process entities', function() {
    this.skip();
  });

  it('process entities with variants', function() {
    this.skip();
  });

  it('process options', function() {
    this.skip();
  });
});