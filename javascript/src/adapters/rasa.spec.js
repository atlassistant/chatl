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
//     {
//       it: 'should process empty entities which refer to another one',
//       dsl: `
// %[my_intent]
//   we should go from @[room] to @[anotherRoom]

// @[room]
//   kitchen
//   bedroom

// @[anotherRoom](type=room)
// `,
//       options: {},
//       expected: {
//         rasa_nlu_data: {
//           common_examples: [],
//           regex_features: [],
//           lookup_tables: [],
//           entity_synonyms: [],
//         }
//       },
//     },
//     {
//       it: 'should process entities with specific properties',
//       dsl: `
// @[city]
//   paris
//   rouen
//   ~[new york]

// @[room](extensible=false, strictness=0.8)
//   kitchen
//   bedroom

// @[date](type=datetime)
//   tomorrow
//   on tuesday

// ~[new york]
//   nyc
//   the big apple
// `,
//       options: {},
//       expected: {
//         rasa_nlu_data: {
//           common_examples: [],
//           regex_features: [],
//           lookup_tables: [],
//           entity_synonyms: [],
//         }
//       },
//     },
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
//     {
//       it: 'should merge options',
//       dsl: `
// @[city]
//   paris
//   rouen
// `,
//       options: { },
//       expected: {
//         rasa_nlu_data: {
//           common_examples: [],
//           regex_features: [],
//           lookup_tables: [],
//           entity_synonyms: [],
//         }
//       },
//     },
  ];


  tests.forEach(test => {
    it (test.it, function() {
      expect(rasa(chatl.parse(test.dsl), test.options)).to.deep.equal(test.expected);
    });
  });
});