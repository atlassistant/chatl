const chatl = require('./index');
const expect = require('chai').expect;

describe('chatl exported module', function () {

  it('parses chatl file', function () {
    const parsed = chatl.parse(`
%[my_intent]
  ~[greet] some training data @[date]
  another training data that uses an @[entity] at @[date#with_variant]

~[greet]
  hi
  hello

@[entity]
  some value
  other value
  ~[a synonym]

~[a synonym]
  possible synonym
  another one

@[date](type=snips/datetime)
  tomorrow
  today

@[date#with_variant]
  the end of the day
  nine o clock
  twenty past five
`);
    expect(Object.keys(parsed.intents).length).to.equal(1);
    expect(parsed.intents).to.have.key('my_intent');
    expect(Object.keys(parsed.entities).length).to.equal(2);
    expect(parsed.entities).to.have.keys([ 'date', 'entity' ]);
    expect(Object.keys(parsed.synonyms).length).to.equal(2);
    expect(parsed.synonyms).to.have.keys([ 'greet', 'a synonym' ]);

    expect(Object.keys(parsed.entities.date.variants).length).to.equal(1);
    expect(parsed.entities.date.props).to.deep.equal({ type: 'snips/datetime' });
    expect(parsed.synonyms['a synonym']).to.deep.equal([ 'possible synonym', 'another one' ]);
  });

  it ('generates raw file from chatl json', function () {
    
  });

});