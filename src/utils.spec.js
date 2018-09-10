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
});