const _ = require ('lodash');
const fp = require('../fp');
const utils = require('../utils');
const Augment = require('../augment');

// As per https://rasa.com/docs/rasa/1.1.4/nlu/training-data-format/
module.exports = function generateTrainingDataset (chatl, options = {}) {
  const augment = new Augment(chatl);

  const buildLookupTable = (acc, _, name) => {
    return acc.concat({
      name,
      elements: augment.getEntity(name).all(),
    });
  };

  const buildIntentExamples = (acc, intent, name) => {
    return acc.concat(fp.map(sentence => {
      const entities = [];

      return {
        intent: name,
        text: fp.reduce((p, c) => {
          if (!utils.isEntity(c)) {
            return p + c.value;
          }

          const value = augment.getEntity(c.value).next(c.variant);

          entities.push({
            start: p.length,
            end: p.length + value.length,
            entity: c.value,
            value,
          });

          return p + value;
        }, '')(sentence),
        entities,
      };
    })(intent.data));
  };

  return _.merge({
    rasa_nlu_data: {
      common_examples: fp.reduce(buildIntentExamples, [])(augment.getIntents()),
      regex_features: [],
      lookup_tables: fp.reduce(buildLookupTable, [])(chatl.entities),
      entity_synonyms: [],
    }
  }, options);
}