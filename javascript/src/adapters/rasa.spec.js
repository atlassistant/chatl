const chatl = require('./../index');
const rasa = chatl.adapters.rasa;
const expect = require('chai').expect;

describe('the rasa adapter', function () {

  const tests = [
    {
      it: 'should process intents correctly',
      dsl: `
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
`,
      options: {},
      expected: {
        rasa_nlu_data: {
          common_examples: [],
          regex_features: [],
          lookup_tables: [],
          entity_synonyms: [],
        }
      },
    },
    {
      it: 'should process empty entities which refer to another one',
      dsl: `
%[my_intent]
  we should go from @[room] to @[anotherRoom]

@[room]
  kitchen
  bedroom

@[anotherRoom](type=room)
`,
      options: {},
      expected: {
        rasa_nlu_data: {
          common_examples: [],
          regex_features: [],
          lookup_tables: [],
          entity_synonyms: [],
        }
      },
    },
    {
      it: 'should process entities with specific properties',
      dsl: `
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
`,
      options: {},
      expected: {
        rasa_nlu_data: {
          common_examples: [],
          regex_features: [],
          lookup_tables: [],
          entity_synonyms: [],
        }
      },
    },
    {
      it: 'should process entities with variants',
      dsl: `
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
`,
      options: {},
      expected: {
        rasa_nlu_data: {
          common_examples: [],
          regex_features: [],
          lookup_tables: [],
          entity_synonyms: [],
        }
      },
    },
    {
      it: 'should merge options',
      dsl: `
@[city]
  paris
  rouen
`,
      options: { },
      expected: {
        rasa_nlu_data: {
          common_examples: [],
          regex_features: [],
          lookup_tables: [],
          entity_synonyms: [],
        }
      },
    },
  ];


  tests.forEach(test => {
    it (test.it, function() {
      expect(rasa(chatl.parse(test.dsl), test.options)).to.deep.equal(test.expected);
    });
  });
});