// const chatl = require('./index');
// const expect = require('chai').expect;

// const rawChatlStuff = `%[my_intent]
//   ~[greet] some training data @[date]
//   another training data that uses an @[entity] at @[date#with_variant]

// @[entity]
//   some value
//   other value
//   ~[a synonym]

// @[date](type=snips/datetime)
//   tomorrow
//   today

// @[date#with_variant]
//   the end of the day
//   nine o clock
//   twenty past five

// ~[greet]
//   hi
//   hello

// ~[a synonym]
//   possible synonym
//   another one
// `;

// describe('chatl exported module', function () {

//   it('parses chatl file', function () {
//     const parsed = chatl.parse(rawChatlStuff);
//     expect(Object.keys(parsed.intents).length).to.equal(1);
//     expect(parsed.intents).to.have.key('my_intent');
//     expect(Object.keys(parsed.entities).length).to.equal(2);
//     expect(parsed.entities).to.have.keys([ 'date', 'entity' ]);
//     expect(Object.keys(parsed.synonyms).length).to.equal(2);
//     expect(parsed.synonyms).to.have.keys([ 'greet', 'a synonym' ]);

//     expect(Object.keys(parsed.entities.date.variants).length).to.equal(1);
//     expect(parsed.entities.date.variants).to.have.key('with_variant');
//     expect(parsed.entities.date.props).to.deep.equal({ type: 'snips/datetime' });
//     expect(parsed.synonyms['a synonym']).to.deep.equal([ 'possible synonym', 'another one' ]);
//   });

//   it ('generates raw file from chatl json', function () {
//     const str = chatl.generate({
//       "intents": {
//         "my_intent": {
//           "props": {},
//           "data": [
//             [
//               {
//                 "type": "synonym",
//                 "value": "greet"
//               },
//               {
//                 "type": "text",
//                 "value": " some training data "
//               },
//               {
//                 "type": "entity",
//                 "value": "date",
//                 "variant": null
//               }
//             ],
//             [
//               {
//                 "type": "text",
//                 "value": "another training data that uses an "
//               },
//               {
//                 "type": "entity",
//                 "value": "entity",
//                 "variant": null
//               },
//               {
//                 "type": "text",
//                 "value": " at "
//               },
//               {
//                 "type": "entity",
//                 "value": "date",
//                 "variant": "with_variant"
//               }
//             ]
//           ]
//         }
//       },
//       "entities": {
//         "entity": {
//           "variants": {},
//           "props": {},
//           "data": [
//             {
//               "value": "some value",
//               "synonyms": []
//             },
//             {
//               "value": "other value",
//               "synonyms": []
//             },
//             {
//               "value": "a synonym",
//               "synonyms": [
//                 "possible synonym",
//                 "another one"
//               ]
//             }
//           ]
//         },
//         "date": {
//           "variants": {
//             "with_variant": [
//               {
//                 "value": "the end of the day",
//                 "synonyms": []
//               },
//               {
//                 "value": "nine o clock",
//                 "synonyms": []
//               },
//               {
//                 "value": "twenty past five",
//                 "synonyms": []
//               }
//             ]
//           },
//           "props": {
//             "type": "snips/datetime"
//           },
//           "data": [
//             {
//               "value": "tomorrow",
//               "synonyms": []
//             },
//             {
//               "value": "today",
//               "synonyms": []
//             }
//           ]
//         }
//       },
//       "synonyms": {
//         "greet": [
//           "hi",
//           "hello"
//         ],
//         "a synonym": [
//           "possible synonym",
//           "another one"
//         ]
//       },
//       "comments": [],
//     });

//     expect(str).to.be.equal(rawChatlStuff);
//   });

// });