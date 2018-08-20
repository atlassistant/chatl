const permutate = require('./../utils').permutate;
const _ = require('lodash');

module.exports = function process(data, options) {
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
                  text: o.variant ? 
                    data.entities[o.value].variants[o.variant][0].value 
                    : data.entities[o.value].data[0].value, 
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
