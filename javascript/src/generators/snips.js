const permutate = require('./../utils').permutate;
const _ = require('lodash');

module.exports = function process(data, options) {

  // Here we are constructing available values for entities and their variant
  // to output different valeus when requesting by the training sentences.

  const variantValues = {};
  const entityValues = {};

  for (const entityName of Object.keys(data.entities)) {
    const entity = data.entities[entityName];

    entityValues[entityName] = {
      values: entity.data.map(o => o.value),
      index: 0,
    }

    variantValues[entityName] = {};

    for (const variantName of Object.keys(entity.variants)) {
      variantValues[entityName][variantName] = {
        values: entity.variants[variantName].map(o => o.value),
        index: 0,
      };
    }
  }

  function getEntityValue(entity, variant) {
    let lookup = variant ? variantValues[entity][variant] : entityValues[entity];

    if (lookup.index >= lookup.values.length) {
      lookup.index = 0;
    }

    return lookup.values[lookup.index++];
  }

  const dataset = {
    language: 'en',
    entities: Object.keys(data.entities).reduce((prev, cur) => {
      const entity = data.entities[cur];
      
      // If the entity/slot has a type property, it should not be added to the inner entities
      if (entity.props.type) {
        if (!prev[entity.props.type]) {
          prev[entity.props.type] = {};
        }
      } else {
        const variantsData = Object.values(entity.variants).reduce((prev, cur) => prev.concat(cur), []);

        prev[cur] = {
          use_synonyms: (entity.data.filter(o => o.synonyms.length > 0).length > 0 
            || variantsData.filter(o => o.synonyms.length > 0).length > 0),
          automatically_extensible: JSON.parse(entity.props.extensible || 'true'),
          data: entity.data.concat(variantsData),
        };
      }

      return prev;
    }, {}),
    intents: Object.keys(data.intents).reduce((prev, cur) => {
      const intent = data.intents[cur];
      const utterances = [];

      const sampleWithSynonyms = intent.data.filter(o => o.filter(oo => oo.type === 'synonym').length > 0);
      const sentences = intent.data.filter(o => o.filter(oo => oo.type === 'synonym').length === 0);

      // Generates all possible sentences with synonym permutations
      for(const sentence of sampleWithSynonyms) {
        const synonymsValue = sentence.reduce((prev, cur) => {
          if (cur.type === 'synonym') {
            prev[cur.value] = data.synonyms[cur.value];
          }
          return prev;
        }, { });

        for (const permutation of permutate([], synonymsValue)) {
          let idx = 0;

          sentences.push(sentence.map(o => o.type === 'synonym' ? ({
            type: 'text',
            value: permutation[idx++],
          }) : o));
        }
      }

      for (const sample of sentences) {
        const sampleSlots = sample.filter(o => o.type !== 'text');

        if (sampleSlots.length > 0) {

          utterances.push({
            data: sample.map(o => {
              if (o.type === 'entity') {
                return { 
                  text: getEntityValue(o.value, o.variant),
                  slot_name: o.value,
                  entity: data.entities[o.value].props.type || o.value
                };
              }

              return { text: o.value };
            }),
          });
        } else {
          utterances.push({ data: sample.map(o => ({ text: o.value })) });
        }
      }

      prev[cur] = {
        utterances,
      };

      return prev;
    }, {}),
  };

  if (options) {
    return _.merge(dataset, JSON.parse(options));
  }

  return dataset;
};
