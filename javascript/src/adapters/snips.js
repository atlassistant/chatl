const _ = require ('lodash');
const fp = require('../fp');
const utils = require('../utils');
const Augment = require('../augment');

const SNIPS_PREFIX = 'snips/';

// As per https://snips-nlu.readthedocs.io/en/0.19.1/dataset.html
module.exports = function generateSnipsDataset(chatl, options={}) {
  const augment = new Augment(chatl);

  const getEntityType = entity => {
    const type = entity.props['type'] || entity.props['snips:type'];

    // If the type is not present in the dataset, let's consider it'a a built-in
    // one.
    return (type && !chatl.entities[type]) ?
      (type.indexOf(SNIPS_PREFIX) === -1 ? SNIPS_PREFIX + type : type)
      : type;
  }

  const buildEntity = (acc, entity, name) => {
    const type = getEntityType(entity);

    if (type) {
      if (type.indexOf(SNIPS_PREFIX) !== -1) {
        return Object.assign(acc, { 
          [type]: {},
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

  const buildSentencePart = part => {
    if (!utils.isEntity(part)) {
      return { text: part.value };
    }

    const entity = chatl.entities[part.value];
    // Retrieve the inner type of the entity if defined in the dataset
    const type = getEntityType(entity) || part.value;
    // And check if it references another defined entity because if it's true,
    // values will be fetched from here
    const referencedEntity = chatl.entities[type] ? type : part.value;

    return {
      entity: type,
      slot_name: part.value,
      text: augment.getEntity(referencedEntity).next(part.variant),
    };
  };

  const buildIntents = intent => ({
    utterances: fp.map(sentence => ({
      data: fp.map(buildSentencePart)(sentence),
    }))(intent.data),
  });

  return _.merge({
    language: 'en',
    intents: fp.map(buildIntents)(augment.getIntents()),
    entities: fp.reduce(buildEntity)(chatl.entities),
  }, options);
};
