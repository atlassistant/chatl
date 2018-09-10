const chatl = require('./../index');
const expect = require('chai').expect;

describe('the snips adapter', function () {
  it ('should output correct intents', function () {
    const result = chatl.parse(`
%[get_forecast](some=prop, something=else)
    will it rain in @[city]
    ~[greet] what's the weather like in @[city#variant]

~[greet]
    hi
    hello
`);

    const dataset = chatl.adapters.snips(result);

    expect(dataset).to.include.key('intents');
    expect(dataset.intents).to.include.key('get_forecast');
    expect(dataset.intents.get_forecast).to.include.key('utterances');
    expect(dataset.intents.get_forecast.utterances).to.be.an('array');
  });

  it ('should output correct entities', function () {

  });

  it ('should handle synonyms correctly', function () {

  });

  it ('make use of given options', function () {

  });
});