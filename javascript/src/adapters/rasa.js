const _ = require ('lodash');
const fp = require('../fp');
const utils = require('../utils');
const Augment = require('../augment');

// As per https://rasa.com/docs/rasa/1.1.4/nlu/training-data-format/
module.exports = function generateTrainingDataset (chatl, options = {}) {
  const augment = new Augment(chatl, true);

  // For rasa, we need a map of synonyms -> value
  const synonymsLookup = fp.reduce((acc, synonyms, value) => 
    fp.append(...fp.map(s => ({ [s]: value }))(synonyms))(acc)
  )(augment.synonymsValues);

  const buildLookupTable = (acc, _, name) => {
    return fp.append({
      name,
      elements: augment.getEntity(name).all(),
    })(acc);
  };

  const buildIntentExamples = (acc, intent, name) => {
    return fp.append(fp.map(sentence => {
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
            value: synonymsLookup[value] || value, // Check if its a synonym here
          });

          return p + value;
        }, '')(sentence),
        entities,
      };
    })(intent.data))(acc);
  };

  const buildEntitySynonyms = (acc, entity, _) => {
    const synonyms = fp.pipe(fp.filter(utils.isSynonym), fp.map(fp.prop('value')))(entity.data);

    if (synonyms.length === 0) {
      return acc;
    }

    return fp.append(fp.map(c => ({
      value: c,
      synonyms: augment.getSynonyms(c),
    }))(synonyms))(acc);
  };

  return _.merge({
    rasa_nlu_data: {
      common_examples: fp.reduce(buildIntentExamples, [])(augment.getIntents()),
      regex_features: [],
      lookup_tables: fp.reduce(buildLookupTable, [])(chatl.entities),
      entity_synonyms: fp.reduce(buildEntitySynonyms, [])(chatl.entities),
    }
  }, options);
}