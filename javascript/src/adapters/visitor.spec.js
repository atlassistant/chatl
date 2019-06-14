const Visitor = require('./visitor');
const expect = require('chai').expect;

const testData = {
  intents: {
    greetings: {
      props: {},
      data: [
        [
          { type: 'text', value: 'just a message without synonyms or anything else!' },
        ],
        [
          { type: 'synonym', value: 'greet' },
          { type: 'text', value: ' from' },
          { type: 'entity', value: 'room', 'variant': null },
          { type: 'text', value: '!' },
        ],
        [
          { type: 'synonym', value: 'greet' },
          { type: 'text', value: ' help me ' },
          { type: 'synonym', value: 'please' },
          { type: 'text', value: ' in ' },
          { type: 'entity', value: 'room', 'variant': 'secondary' },
        ],
      ],
    },
  },
  entities: {
    room: {
      variants: {
        secondary: [
          { type: 'text', value: 'bedroom' },
          { type: 'text', value: 'bathroom' },
        ],
      },
      props: {},
      data: [
        { type: 'text', value: 'kitchen' },
        { type: 'synonym', value: 'basement' },
      ],
    }
  },
  synonyms: {
    greet: {
      props: {},
      data: [
        { type: 'text', value: 'hey' },
        { type: 'text', value: 'hello' },
      ],
    },
    please: {
      props: {},
      data: [
        { type: 'text', value: 'please' },
        { type: 'text', value: 'I beg you' },        
      ],
    },
    basement: {
      props: {},
      data: [
        { type: 'text', value: 'cellar' },
      ],
    }
  },
}

describe('the visitor class', function () {
  it ('should compute synonyms values', function () {
    const v = new Visitor(testData);

    expect(v.flattenSynonyms()).to.deep.equal({
      greet: ['hey', 'hello'],
      please: ['please', 'I beg you'],
      basement: ['cellar'],
    });
  });

  it ('should returns the provided data by default with synonyms permutated', function () {
    const v = new Visitor(testData);

    expect(v.process()).to.deep.equal({
      'intents': {
        'greetings': {
          'props': {},
          'data': [
            [
              { 'type': 'text', 'value': 'just a message without synonyms or anything else!' },
            ],
            [
              { 'type': 'text', 'value': 'hey' },
              { 'type': 'text', 'value': ' from' },
              { 'type': 'entity', 'value': 'room', 'variant': null },
              { 'type': 'text', 'value': '!' },
            ],
            [
              { 'type': 'text', 'value': 'hello' },
              { 'type': 'text', 'value': ' from' },
              { 'type': 'entity', 'value': 'room', 'variant': null },
              { 'type': 'text', 'value': '!' },
            ],
            [
              { 'type': 'text', 'value': 'hey' },
              { 'type': 'text', 'value': ' help me ' },
              { 'type': 'text', 'value': 'please' },
              { 'type': 'text', 'value': ' in ' },
              { 'type': 'entity', 'value': 'room', 'variant': 'secondary' },
            ],
            [
              { 'type': 'text', 'value': 'hey' },
              { 'type': 'text', 'value': ' help me ' },
              { 'type': 'text', 'value': 'I beg you' },
              { 'type': 'text', 'value': ' in ' },
              { 'type': 'entity', 'value': 'room', 'variant': 'secondary' },
            ],
            [
              { 'type': 'text', 'value': 'hello' },
              { 'type': 'text', 'value': ' help me ' },
              { 'type': 'text', 'value': 'please' },
              { 'type': 'text', 'value': ' in ' },
              { 'type': 'entity', 'value': 'room', 'variant': 'secondary' },
            ],
            [
              { 'type': 'text', 'value': 'hello' },
              { 'type': 'text', 'value': ' help me ' },
              { 'type': 'text', 'value': 'I beg you' },
              { 'type': 'text', 'value': ' in ' },
              { 'type': 'entity', 'value': 'room', 'variant': 'secondary' },
            ],
          ],
        },
      },
      'entities': {
        'room': {
          'variants': {
            'secondary': [
              { 'type': 'text', 'value': 'bedroom' },
              { 'type': 'text', 'value': 'bathroom' },
            ],
          },
          'props': {},
          'data': [
            { 'type': 'text', 'value': 'kitchen' },
            { 'type': 'synonym', 'value': 'basement' },
          ],
        }
      },
      'synonyms': {
        'greet': {
          'props': {},
          'data': [
            { 'type': 'text', 'value': 'hey' },
            { 'type': 'text', 'value': 'hello' },
          ],
        },
        'please': {
          'props': {},
          'data': [
            { 'type': 'text', 'value': 'please' },
            { 'type': 'text', 'value': 'I beg you' },        
          ],
        },
        'basement': {
          'props': {},
          'data': [
            { 'type': 'text', 'value': 'cellar' },
          ],
        }
      },
    });
  });
});