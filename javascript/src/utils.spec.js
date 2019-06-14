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
});
