const _ = require ('lodash');
const fp = require('../fp');
const utils = require('../utils');
const Augment = require('../augment');

// As per https://rasa.com/docs/rasa/nlu/training-data-format
module.exports = function generateTrainingDataset (chatl, options = {}) {
  const augment = new Augment(chatl);

  return _.merge({
    rasa_nlu_data: {
      common_examples: [],
      regex_features: [],
      lookup_tables: [],
      entity_synonyms: [],
    }
  }, options);
}