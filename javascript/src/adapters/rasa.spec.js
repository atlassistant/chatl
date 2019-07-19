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
  ~[greet?] what's the weather like in @[city#variant]

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
          common_examples: [
            {
              text: 'will it rain in paris on tomorrow',
              intent: 'get_forecast',
              entities: [
                { start: 16, end: 21, value: 'paris', entity: 'city' },
                { start: 25, end: 33, value: 'tomorrow', entity: 'date' },
              ],
            },
            {
              text: "what's the weather like in new york",
              intent: 'get_forecast',
              entities: [
                { start: 27, end: 35, value: 'new york', entity: 'city' },
              ],
            },
            {
              text: "hi what's the weather like in los angeles",
              intent: 'get_forecast',
              entities: [
                { start: 30, end: 41, value: 'los angeles', entity: 'city' },
              ],
            },
            {
              text: "hello what's the weather like in new york",
              intent: 'get_forecast',
              entities: [
                { start: 33, end: 41, value: 'new york', entity: 'city' },
              ],
            },
          ],
          regex_features: [],
          lookup_tables: [
            {
              name: 'city',
              elements: ['paris', 'rouen', 'new york', 'los angeles'],
            },
            {
              name: 'date',
              elements: ['tomorrow'],
            },
          ],
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
          common_examples: [
            {
              text: 'we should go from kitchen to bedroom',
              intent: 'my_intent',
              entities: [
                { start: 18, end: 25, value: 'kitchen', entity: 'room' },
                { start: 29, end: 36, value: 'bedroom', entity: 'room' },
              ],
            },
          ],
          regex_features: [],
          lookup_tables: [
            {
              name: 'room',
              elements: ['kitchen', 'bedroom'],
            },
          ],
          entity_synonyms: [],
        }
      },
    },
    {
      it: 'should process entities with specific properties',
      dsl: `
@[zipcode](regex=\`[0-9]{5}\`)
  27000
  76000
  27310
`,
      options: {},
      expected: {
        rasa_nlu_data: {
          common_examples: [],
          regex_features: [
            {
              name: 'zipcode',
              pattern: '[0-9]{5}',
            }
          ],
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
          lookup_tables: [
            {
              name: 'city',
              elements: ['paris', 'rouen', 'new york', 'one variant', 'another one'],
            },
          ],
          entity_synonyms: [
            {
              value: 'new york',
              synonyms: ['nyc', 'the big apple'],
            },
          ],
        }
      },
    },
    {
      it: 'should use synonyms appropriately in common_examples',
      dsl: `
%[my_intent]
  this one use @[an_entity]
  another @[an_entity] is used here
  and another @[an_entity] here
  and the last @[an_entity]

@[an_entity]
  entity
  ~[entity_synonym]

~[entity_synonym]
  one
  two
`,
      options: {},
      expected: {
        rasa_nlu_data: {
          common_examples: [
            {
              text: 'this one use entity',
              intent: 'my_intent',
              entities: [
                { start: 13, end: 19, entity: 'an_entity', value: 'entity' },
              ],
            },
            {
              text: 'another entity_synonym is used here',
              intent: 'my_intent',
              entities: [
                { start: 8, end: 22, entity: 'an_entity', value: 'entity_synonym' },
              ],
            },
            {
              text: 'and another one here',
              intent: 'my_intent',
              entities: [
                { start: 12, end: 15, entity: 'an_entity', value: 'entity_synonym' },
              ],
            },
            {
              text: 'and the last two',
              intent: 'my_intent',
              entities: [
                { start: 13, end: 16, entity: 'an_entity', value: 'entity_synonym' },
              ],
            },
          ],
          regex_features: [],
          lookup_tables: [
            {
              name: 'an_entity',
              elements: ['entity', 'entity_synonym'],
            },
          ],
          entity_synonyms: [
            {
              value: 'entity_synonym',
              synonyms: ['one', 'two'],
            },
          ],
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
      options: {
        rasa_nlu_data: {
          entity_synonyms: [
            {
              value: 'new york',
              synonyms: ['ny', 'nyc'],
            },
          ],
        },
      },
      expected: {
        rasa_nlu_data: {
          common_examples: [],
          regex_features: [],
          lookup_tables: [
            {
              name: 'city',
              elements: ['paris', 'rouen'],
            },
          ],
          entity_synonyms: [
            {
              value: 'new york',
              synonyms: ['ny', 'nyc'],
            },
          ],
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