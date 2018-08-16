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
        const variants_data = Object.values(entity.variants).reduce((prev, cur) => prev.concat(cur), []);

        prev[cur] = {
          use_synonyms: (entity.data.filter(o => o.synonyms.length > 0).length > 0 
            || variants_data.filter(o => o.synonyms.length > 0).length > 0),
          automatically_extensible: JSON.parse(entity.props.extensible || 'true'),
          data: entity.data.concat(variants_data),
        };
      }

      return prev;
    }, {}),
    intents: Object.keys(data.intents).reduce((prev, cur) => {
      const intent = data.intents[cur];
      const utterances = [];

      for (const sample of intent.data) {
        const sampleSlots = sample.filter(o => o.type === 'entity');

        // If it needs permutations, do it here
        if (sampleSlots.length > 0) {
          const slots = sample.filter(o => o.type === 'entity').reduce((prev, cur) => {
            if (cur.variant) {
              prev[cur.value] = data.entities[cur.value].variants[cur.variant].map(o => o.value);
            } else {
              prev[cur.value] = data.entities[cur.value].data.map(o => o.value);
            }
  
            return prev;
          }, {});
  
          for (const permutation of permutate([], slots)) {
            let curData = [];
            let idx = 0;

            for (const sampleData of sample) {
              if (sampleData.type === 'text') {
                curData.push({ text: sampleData.value });
              } else if (sampleData.type === 'entity') {
                curData.push({
                  text: permutation[idx++],
                  slot_name: sampleData.value,
                  entity: data.entities[sampleData.value].props.type || sampleData.value,
                });                
              }
            }

            utterances.push({
              data: curData,
            });
          }
        } else {
          utterances.push({
            data: sample.map(o => ({ text: o.value })),
          });
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
