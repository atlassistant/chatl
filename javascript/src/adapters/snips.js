const _ = require ('lodash');
const fp = require('../fp');
const utils = require('../utils');
const Augment = require('../augment');

const SNIPS_PREFIX = 'snips/';

module.exports = function generateSnipsDataset(chatl, options={}) {
  const augment = new Augment(chatl);

  const getEntityType = entity => entity.props['type'] || entity.props['snips:type'];

  const buildEntity = (acc, entity, name) => {
    const type = getEntityType(entity);

    if (type) {
      // If it has a type but not present in the dataset, it should be a
      // built-in entity, so returns an empty object
      if (!chatl.entities[type]) {
        return Object.assign(acc, { 
          [(type.indexOf(SNIPS_PREFIX) === -1 ?
          SNIPS_PREFIX + type
          : type)]: {},
        });
      }

      // It has a type present in the dataset, it should be considered as a slot
      return acc;
    }

    let useSynonyms = false;
    const values = fp.map(e => {
      const synonyms = augment.getSynonyms(e);
      useSynonyms = useSynonyms || (synonyms.length > 0);
      return {
        value: e,
        synonyms,
      };
    })(augment.getEntity(name).all());

    return Object.assign(acc, {
      [name]: {
        data: values,
        automatically_extensible: (entity.props.extensible || 'true') === 'true',
        matching_strictness: Number(entity.props.strictness || '1'),
        use_synonyms: useSynonyms,
      },
    });
  };

  return _.merge({
    language: 'en',
    intents: {},
    entities: fp.reduce(buildEntity)(chatl.entities),
  }, options);
};

function generateTrainingDataset (chatlData, options = {}) {
  const dataset = {
    language: 'en',
    intents: {},
    entities: {},
  };

  const entitiesIdx = {};

  const entities = chatlData.entities || {};
  const intents = chatlData.intents || {};
  const synonyms = chatlData.synonyms || {};

  // Utilities functions
  function getEntityTypeBackport(entityProps) {
    let propType = entityProps.type;
    const snipsType = entityProps['snips:type'];

    if (snipsType) {
      propType = snipsType.replace(SNIPS_PREFIX, '');
      console.warn('snips:type has been replaced by type. You should now leave the snips/ prefix away when using it');
    }

    if (propType && !_.has(entities, propType) && propType.indexOf(SNIPS_PREFIX) === -1) {
      return SNIPS_PREFIX + propType;
    }

    return propType;
  }

  function getEntityOrVariantValue(entity, variant) {
    let ed = entities[entity] || {};
    const propType = getEntityTypeBackport(ed.props || {});
    
    // If it refers to another entity, use their values instead
    if (_.has(entities, propType)) {
      entity = propType;
      ed = entities[entity] || {};
    }
    
    let d = ed.data || [];
    const key = entity + variant;
    
    if (variant) {
      d = (ed.variants || {})[variant] || [];
    }

    if (!_.has(entitiesIdx, key) || entitiesIdx[key] >= d.length - 1) {
      entitiesIdx[key] = 0;
    } else {
      entitiesIdx[key] += 1;
    }

    return d[entitiesIdx[key]].value;
  }

  function getSentenceValue(rawData) {
    const t = rawData.type || 'text';
    const v = rawData.value;

    if (t === 'text') {
      return {
        text: v,
      };
    } else if (t === 'entity') {
      return {
        text: getEntityOrVariantValue(v, rawData.variant),
        slot_name: v,
        entity: getEntityTypeBackport((entities[v] || {}).props || {}) || v,
      };
    }

    return {};
  }

  // Process entities first

  _.each(entities, function (entity, name) {
    const variantsValue = _.values(entity.variants || {});
    const variantsData = _.flatten(variantsValue);

    const entityData = (entity.data || []).concat(variantsData);
    const props = entity.props || {}
    const propType = getEntityTypeBackport(props);

    if (!propType) {
      const data = [];
      let use_synonyms = false;

      _.each(entityData, function (d) {
        const t = d.type || 'text';
        const v = d.value;

        if (t === 'text') {
          data.push({
            value: v,
            synonyms: [],
          });
        } else if(t === 'synonym') {
          const synonyms = ((chatlData.synonyms || {})[v] || {}).data || [];
          use_synonyms = true;

          data.push({
            value: v,
            synonyms: synonyms.map(function (o) {
              return o.value;
            }),
          });
        }
      });

      dataset.entities[name] = {
        data,
        use_synonyms,
        automatically_extensible: (props.extensible || 'true') === 'true',
        matching_strictness: Number(props.strictness || '1'),
      };
    } else if (!_.has(entities, propType)) {
      dataset.entities[propType] = {};
    }
  });

  // And then intents
  // For intents, we need to generate all permutations for synonyms

  _.each(intents, function (intent, name) {
    const intentData = intent.data || [];
    const utterances = [];

    _.each(intentData, function (sentence) {
      const synonymsInSentence = sentence.filter(function (o) {
        return o.type === 'synonym';
      })

      if (synonymsInSentence.length > 0) {
        const synonymValues = synonymsInSentence.reduce(function (prev, cur) {
          prev[cur.value] = ((synonyms[cur.value] || {}).data || []).map(function (d) {
            return d.value;
          });

          return prev;
        }, {});

        const permutations = utils.permutate(synonymValues);
        
        _.each(permutations, function (permutation) {
          const curSentence = [];
          let permutIdx = 0;

          _.each(sentence, function (data) {
            if (data.type === 'synonym') {
              data = {
                type: 'text',
                value: permutation[permutIdx],
              };

              permutIdx += 1;
            }

            curSentence.push(getSentenceValue(data));
          });

          utterances.push({
            data: curSentence,
          });
        });
      } else {
        utterances.push({
          data: sentence.map(getSentenceValue),
        });
      }
    });

    dataset.intents[name] = {
      utterances,
    };
  });

  return _.merge(dataset, options);
}