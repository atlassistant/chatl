const _ = require ('lodash');

module.exports = function generateTrainingDataset (chatlData, options = {}) {
  const dataset = {
    language: 'en',
    intents: {},
    entities: {},
  };

  // Generates every permutations for intents synonyms
  _.forEach(chatlData.intents, (intent, name) => {
    dataset.intents[name] = {
      utterances: [],
    };
  });

  return dataset;
}