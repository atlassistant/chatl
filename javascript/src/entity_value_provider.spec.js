const expect = require('chai').expect;
const EntityValueProvider = require('./entity_value_provider');

describe('the entity value provider class', function () {

  const tests = [
    {
      it: 'should provide different values each time and loop as needed',
      entity: {
        variants: {},
        data: [
          { type: 'text', value: 'paris' },
          { type: 'synonym', value: 'new york' },
          { type: 'text', value: 'london' },
        ],
      },
      variant: null,
      expected: ['paris', 'new york', 'london', 'paris'],
    },
    {
      it: 'should provide different variant values each time and loop as needed',
      entity: {
        variants: {
          secondary: [
            { type: 'text', value: 'bedroom' },
            { type: 'text', value: 'bathroom' },
          ],
        },
        data: [
          { type: 'text', value: 'kitchen' },
        ],
      },
      variant: 'secondary',
      expected: ['bedroom', 'bathroom', 'bedroom'],
    },
  ];

  tests.forEach(test => {
    it (test.it, function () {
      const provider = new EntityValueProvider(test.entity);

      test.expected.forEach(expectedOutput => {
        expect(provider.next(test.variant)).to.equal(expectedOutput);
      });
    });
  });

  it ('should extract variants indices and values', function () {
    const p = new EntityValueProvider({
      variants: {
        secondary: [ { type: 'text', value: 'a variant' } ]
      },
      data: [],
    });

    expect(p.indices).to.deep.equal({
      '_': -1,
      'secondary': -1,
    });

    expect(p.data).to.deep.equal({
      '_': [],
      'secondary': ['a variant'],
    });
  });

  it ('should provide a way to retrieve all valid entity values', function() {
    const provider = new EntityValueProvider({
      variants: {
        secondary: [
          { type: 'text', value: 'bedroom' },
          { type: 'text', value: 'bathroom' },
        ],
      },
      data: [
        { type: 'text', value: 'kitchen' },
        { type: 'synonym', value: 'basement' },
      ],
    });

    expect(provider.all()).to.deep.equal([
      'kitchen',
      'basement',
      'bedroom',
      'bathroom',
    ]);
  });

});