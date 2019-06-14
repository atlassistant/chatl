const _ = require('lodash');

// As per https://rasa.com/docs/rasa/nlu/training-data-format
module.exports = function generateTrainingDataset (chatlData, options = {}) {
  const dataset = {
    'rasa_nlu_data': {
      'common_examples': [],
      'regex_features' : [],
      'lookup_tables'  : [],
      'entity_synonyms': [],
    }
  };

  // TODO: implement a Rasa visitor

  return _.merge(dataset, options);
}