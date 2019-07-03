const expect = require('chai').expect;
const EntityValueProvider = require('./entity_value_provider');
const Augment = require('./augment');

describe('the augment class', function () {

  const getIntentsTests = [
    {
      it: 'should do nothing if no synonym were found',
      dataset: {
        intents: {
          hello: {
            data: [ [ { type: 'text', value: 'hello there' } ] ],
          },
        },
        synonyms: {},
      },
      expected: {
        hello: {
          data: [ [ { type: 'text', value: 'hello there' } ] ],
        },
      },
    },
    {
      it: 'should permutate when there is at least one synonym in the sentence',
      dataset: {
        intents: {
          greetings: {
            props: { a: 5 },
            data: [
              [
                { type: 'synonym', value: 'hey', optional: false },
                { type: 'text', value: ' there, how are you?' },
              ],
              [
                { type: 'text', value: 'nothing should change here' },
              ],
            ],
          }
        },
        synonyms: {
          hey: {
            data: [
              { type: 'text', value: 'hello' },
              { type: 'text', value: 'hi' },
            ],
          },
        },
      },
      expected: {
        greetings: {
          props: { a: 5 },
          data: [
            [
              { type: 'text', value: 'hello' },
              { type: 'text', value: ' there, how are you?' },
            ],
            [
              { type: 'text', value: 'hi' },
              { type: 'text', value: ' there, how are you?' },
            ],
            [
              { type: 'text', value: 'nothing should change here' },
            ],
          ],
        }
      },
    },
    {
      it: 'should permutate when there is more than one synonym in the sentence',
      dataset: {
        intents: {
          sample: {
            data: [
              [
                { type: 'synonym', value: 'object', optional: false },
                { type: 'text', value: ' is '},
                { type: 'synonym', value: 'color' },
              ]
            ],
          },
        },
        synonyms: {
          object: {
            data: [
              { type: 'text', value: 'car' },
              { type: 'text', value: 'flower' },
            ],
          },
          color: {
            data: [
              { type: 'text', value: 'green' },
              { type: 'text', value: 'red' },
            ],
          },
        },
      },
      expected: {
        sample: {
          data: [
            [
              { type: 'text', value: 'car' },
              { type: 'text', value: ' is '},
              { type: 'text', value: 'green' },
            ],
            [
              { type: 'text', value: 'car' },
              { type: 'text', value: ' is '},
              { type: 'text', value: 'red' },
            ],
            [
              { type: 'text', value: 'flower' },
              { type: 'text', value: ' is '},
              { type: 'text', value: 'green' },
            ],
            [
              { type: 'text', value: 'flower' },
              { type: 'text', value: ' is '},
              { type: 'text', value: 'red' },
            ],
          ],
        },
      },
    },
    {
      it: 'shoud permutate with optional synonyms too',
      dataset: {
        intents: {
          sample: {
            data: [
              [
                { type: 'synonym', value: 'greet', optional: true },
                { type: 'text', value: ' how are ' },
                { type: 'synonym', value: 'you', optional: true },
              ]
            ],
          },
        },
        synonyms: {
          greet: {
            data: [
              { type: 'text', value: 'hi' },
              { type: 'text', value: 'hey' },
            ],
          },
          you: {
            data: [
              { type: 'text', value: 'you' },
              { type: 'text', value: 'ya' },
            ],
          },
        },
      },
      expected: {
        sample: {
          data: [
            [
              { type: 'text', value: 'how are' },
            ],
            [
              { type: 'text', value: 'how are ' },
              { type: 'text', value: 'you' },
            ],
            [
              { type: 'text', value: 'how are ' },
              { type: 'text', value: 'ya' },
            ],
            [
              { type: 'text', value: 'hi' },
              { type: 'text', value: ' how are' },
            ],
            [
              { type: 'text', value: 'hi' },
              { type: 'text', value: ' how are ' },
              { type: 'text', value: 'you' },
            ],
            [
              { type: 'text', value: 'hi' },
              { type: 'text', value: ' how are ' },
              { type: 'text', value: 'ya' },
            ],
            [
              { type: 'text', value: 'hey' },
              { type: 'text', value: ' how are' },
            ],
            [
              { type: 'text', value: 'hey' },
              { type: 'text', value: ' how are ' },
              { type: 'text', value: 'you' },
            ],
            [
              { type: 'text', value: 'hey' },
              { type: 'text', value: ' how are ' },
              { type: 'text', value: 'ya' },
            ],
          ],
        },
      },
    }
  ];

  getIntentsTests.forEach(test => {
    it (test.it, function () {
      const state = new Augment(test.dataset);

      expect(state.getIntents()).to.deep.equal(test.expected);
    });
  });

  it ('should provide a way to retrieve entity value provider', function() {
    const augment = new Augment({
      entities: {
        city: {
          variants: {
            secondary: [
              { type: 'text', value: 'new york' },
            ],
          },
          data: [
            { type: 'text', value: 'paris' },
            { type: 'text', value: 'rouen' },
          ],
        },
      },
    });

    expect(augment.getEntity('city')).to.deep.equal(new EntityValueProvider(augment.entities.city));
  });

  it ('should raise an error when trying to retrieve an invalid entity', function () {
    const augment = new Augment({});

    expect(() => augment.getEntity('some_entity')).to.throw('Could not find an entity with the name: some_entity');
  });

  it ('should retrieve synonyms for an entity', function () {
    const augment = new Augment({
      synonyms: {
        'new york': {
          data: [
            { type: 'text', value: 'ny' },
            { type: 'text', value: 'nyc' },
          ],
        },
      },
    });

    expect(augment.getSynonyms('new york')).to.deep.equal(['ny', 'nyc']);
    expect(augment.getSynonyms('room')).to.be.empty;
  });

  it ('should satisfy the useSynonymsInEntityValueProvider parameter', function () {
    const augment = new Augment({
      entities: {
        city: {
          props: {},
          data: [
            { type: 'synonym', value: 'new york' },
          ],
        },
      },
      synonyms: {
        'new york': {
          data: [
            { type: 'text', value: 'ny' },
            { type: 'text', value: 'nyc' },
          ],
        },
      },
    }, true);

    expect(augment.getEntity('city').next()).to.equal('new york');
    expect(augment.getEntity('city').next()).to.equal('ny');
    expect(augment.getEntity('city').next()).to.equal('nyc');
    expect(augment.getEntity('city').next()).to.equal('new york');
    expect(augment.getEntity('city').all()).to.deep.equal(['new york']);
  });

});