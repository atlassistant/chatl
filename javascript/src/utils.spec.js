const expect = require ('chai').expect;
const utils = require ('./utils');

describe ('the utils module', function () {
  it ('should handle permutations', function () {
    const permutations = utils.permutate({
      city: ['paris', 'london'],
      date: ['today', 'tomorrow'],
    });

    expect (permutations).to.be.an('array');
    expect (permutations).to.deep.equal([
      [ 'paris', 'today' ],
      [ 'paris', 'tomorrow' ],
      [ 'london', 'today' ],
      [ 'london', 'tomorrow' ],
    ]);
  });

  it ('should add decimals to numbers when needed', function () {
    const r = utils.toJSON({
      matching_strictness: 1,
      other_value: 2.3,
      entities: {
        data: [
          'something',
        ],
      },
    });

    expect(r).to.equal(`{
  "matching_strictness": 1.0,
  "other_value": 2.3,
  "entities": {
    "data": [
      "something"
    ]
  }
}`);
  });

  it ('should be able to check for synonyms nodes', function () {
    expect(utils.isSynonym({ 'type': 'text' })).to.be.false
    expect(utils.isSynonym({ 'type': 'entity' })).to.be.false
    expect(utils.isSynonym({ 'type': 'synonym' })).to.be.true
  });

  it ('should be able to check for entity nodes', function () {
    expect(utils.isEntity({ 'type': 'text' })).to.be.false
    expect(utils.isEntity({ 'type': 'synonym' })).to.be.false
    expect(utils.isEntity({ 'type': 'entity' })).to.be.true
  });

  it ('should be able to check for text nodes', function () {
    expect(utils.isText({ 'type': 'entity' })).to.be.false
    expect(utils.isText({ 'type': 'synonym' })).to.be.false
    expect(utils.isText({ 'type': 'text' })).to.be.true
  });

  it ('should merge complex objects correctly', function () {
    const a = {
      one: 'value',
      b: false,
      arr: [1, 2],
      with: {
        nested: {
          prop: 'here!',
        },
      },
    };

    const b = {
      arr: [3],
      b: false,
      another: 'value',
      with: {
        nested: {
          arr: [1, 2],
        },
      },
    };

    const c = {
      arr: [4],
      another: 'value overloaded',
      b: true,
      with: {
        nested: {
          arr: [3, 4, 5, 6],
        },
      },
    };

    expect(utils.merge(a, b, c)).to.deep.equal({
      one: 'value',
      another: 'value overloaded',
      b: true,
      arr: [1, 2, 3, 4],
      with: {
        nested: {
          arr: [1, 2, 3, 4, 5, 6],
          prop: 'here!',
        },
      },
    });
  });

  it ('should merge multiple datasets intelligently', function () {
    const a = {
      intents: {
        get_forecast: {
          props: { some: 'prop' },
          data: [
            [
              { type: 'text', value: 'will it rain in ' },
              { type: 'entity', value: 'city', variant: null },
            ],
          ],
        }
      },
      entities: {
        city: {
          variants: {
            cityVariant: [
              { type: 'text', value: 'london' },
              { type: 'synonym', value: 'new york' },
            ],
          },
          data: [
            { type: 'text', value: 'paris' },
            { type: 'text', value: 'rouen' },
            { type: 'synonym', value: 'new york' },
          ],
          props: { some: 'entity prop' },
        },
      },
      synonyms: {
        'new york': {
          props: { syn: 'prop' },
          data: [
            { type: 'text', value: 'nyc' },
          ],
        },
      },
    };

    const b = {
      intents: {
        get_forecast: {
          props: { other: 'intent prop' },
          data: [
            [
              { type: 'text', value: 'will it snow in ' },
              { type: 'entity', value: 'city', variant: null },
            ],
          ],
        },
      },
      entities: {
        city: {
          props: { another: 'prop' },
          variants: {},
          data: [
            { type: 'text', value: 'new york' },
            { type: 'text', value: 'metz' },
            { type: 'text', value: 'caen' },
            { type: 'text', value: 'paris' },
          ],
        },
      },
      synonyms: {},
    };

    const c = {
      intents: {
        lights_on: {
          props: {},
          data: [ [ { type: 'text', value: 'turn the lights on' } ] ],
        },
      },
      entities: {
        city: {
          props: {},
          data: [],
          variants: {
            cityElsewhere: [ { type: 'text', value: 'amsterdam' } ],
            cityVariant: [ { type: 'text', value: 'sydney' } ],
          },
        },
        room: {
          props: {},
          data: [],
          variants: {},
        },
      },
      synonyms: {
        basement: {
          props: {},
          data: [ { type: 'text', value: 'cellar' } ],
        },
        'new york': {
          props: { another: 'prop' },
          data: [
            { type: 'text', value: 'ny' },
            { type: 'text', value: 'nyc' },
          ],
        },
      },
    };
    
    expect(utils.merge(a, b, c)).to.deep.equal({
      intents: {
        get_forecast: {
          props: { some: 'prop', other: 'intent prop' },
          data: [
            [
              { type: 'text', value: 'will it rain in ' },
              { type: 'entity', value: 'city', variant: null },
            ],
            [
              { type: 'text', value: 'will it snow in ' },
              { type: 'entity', value: 'city', variant: null },
            ],
          ],
        },
        lights_on: {
          props: {},
          data: [ [ { type: 'text', value: 'turn the lights on' } ] ],
        },
      },
      entities: {
        city: {
          variants: {
            cityElsewhere: [ { type: 'text', value: 'amsterdam' } ],
            cityVariant: [
              { type: 'text', value: 'london' },
              { type: 'synonym', value: 'new york' },
              { type: 'text', value: 'sydney' },
            ],
          },
          data: [
            { type: 'text', value: 'paris' },
            { type: 'text', value: 'rouen' },
            { type: 'synonym', value: 'new york' },
            { type: 'text', value: 'new york' },
            { type: 'text', value: 'metz' },
            { type: 'text', value: 'caen' },
          ],
          props: { some: 'entity prop', another: 'prop' },
        },
        room: {
          props: {},
          data: [],
          variants: {},
        },
      },
      synonyms: {
        'new york': {
          props: { syn: 'prop', another: 'prop' },
          data: [
            { type: 'text', value: 'nyc' },
            { type: 'text', value: 'ny' },
          ],
        },
        basement: {
          props: {},
          data: [ { type: 'text', value: 'cellar' } ],
        },
      },
    });
  });
});
