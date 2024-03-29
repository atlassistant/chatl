const chatl = require('./../index');
const snips = chatl.adapters.snips;
const expect = require('chai').expect;

describe('the snips adapter', function () {

  const tests = [
    {
      it: 'should allow obsolete declaration of type for now',
      dsl: `
@[date](snips:type=snips/datetime)
  tomorrow
`,
      options: {},
      expected: {
        language: 'en',
        intents: {},
        entities: {
          'snips/datetime': {},
        },
      },
    },
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
        language: 'en',
        intents: {
          get_forecast: {
            utterances: [
              {
                data: [
                  { text: 'will it rain in ' },
                  { text: 'paris', entity: 'city', slot_name: 'city' },
                  { text: ' on ' },
                  { text: 'tomorrow', entity: 'snips/datetime', slot_name: 'date' },
                ],
              },
              {
                data: [
                  { text: "what's the weather like in " },
                  { text: 'new york', entity: 'city', slot_name: 'city' },
                ],
              },
              {
                data: [
                  { text: 'hi' },
                  { text: " what's the weather like in " },
                  { text: 'los angeles', entity: 'city', slot_name: 'city' },
                ],
              },
              {
                data: [
                  { text: 'hello' },
                  { text: " what's the weather like in " },
                  { text: 'new york', entity: 'city', slot_name: 'city' },
                ],
              },
            ],
          },
        },
        entities: {
          city: {
            data: [
              { value: 'paris', synonyms: [] },
              { value: 'rouen', synonyms: [] },
              { value: 'new york', synonyms: [] },
              { value: 'los angeles', synonyms: [] },
            ],
            automatically_extensible: true,
            matching_strictness: 1,
            use_synonyms: false,
          },
          'snips/datetime': {},
        },
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
        language: 'en',
        intents: {
          my_intent: {
            utterances: [
              {
                data: [
                  { text: 'we should go from ' },
                  { text: 'kitchen', entity: 'room', slot_name: 'room' },
                  { text: ' to ' },
                  { text: 'bedroom', entity: 'room', slot_name: 'anotherRoom' },
                ],
              },
            ],
          },
        },
        entities: {
          room: {
            data: [
              { value: 'kitchen', synonyms: [] },
              { value: 'bedroom', synonyms: [] },
            ],
            automatically_extensible: true,
            matching_strictness: 1,
            use_synonyms: false,
          },
        },
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
        language: 'en',
        intents: {},
        entities: {
          city: {
            data: [
              { value: 'paris', synonyms: [] },
              { value: 'rouen', synonyms: [] },
              { value: 'new york', synonyms: ['nyc', 'the big apple'] },
            ],
            automatically_extensible: true,
            matching_strictness: 1,
            use_synonyms: true,
          },
          room: {
            data: [
              { value: 'kitchen', synonyms: [] },
              { value: 'bedroom', synonyms: [] },
            ],
            automatically_extensible: false,
            matching_strictness: 0.8,
            use_synonyms: false,
          },
          'snips/datetime': {},
        },
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
  ~[variant synonym]

~[new york]
  nyc
  the big apple

~[variant synonym]
  one
  two
`,
      options: {},
      expected: {
        language: 'en',
        intents: {},
        entities: {
          city: {
            data: [
              { value: 'paris', synonyms: [] },
              { value: 'rouen', synonyms: [] },
              { value: 'new york', synonyms: ['nyc', 'the big apple'] },
              { value: 'one variant', synonyms: [] },
              { value: 'another one', synonyms: [] },
              { value: 'variant synonym', synonyms: ['one', 'two'] },
            ],
            automatically_extensible: true,
            matching_strictness: 1,
            use_synonyms: true,
          },
        },
      },
    },
    {
      it: 'should merge options',
      dsl: `
@[city]
  paris
  rouen
`,
      options: { language: 'fr' },
      expected: {
        language: 'fr',
        intents: {},
        entities: {
          city: {
            data: [
              { value: 'paris', synonyms: [] },
              { value: 'rouen', synonyms: [] },
            ],
            automatically_extensible: true,
            matching_strictness: 1,
            use_synonyms: false,
          },
        },
      },
    },
  ];


  tests.forEach(test => {
    it (test.it, function() {
      expect(snips(chatl.parse(test.dsl), test.options)).to.deep.equal(test.expected);
    });
  });
});