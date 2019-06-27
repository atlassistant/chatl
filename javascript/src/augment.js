const fp = require('./fp');
const utils = require('./utils');
const EntityValueProvider = require('./entity_value_provider');

/**
 * The augment class provide helpers methods to augment a chatl parsed data
 * tree and make the process of writing adapters easier.
 */
class Augment {

  /**
   * Instantiate a new augment object with the given data.
   * @param {Object} parsedData Chatl parsed data.
   */
  constructor(parsedData) {
    this.intents = parsedData.intents || {};
    this.entities = parsedData.entities || {};
    this.synonyms = parsedData.synonyms || {};

    // Let's flatten some stuff right now
    this._synonymsValues = fp.map(
      fp.pipe(fp.prop('data'), fp.map(fp.prop('value'))))(this.synonyms);
    this._entitiesValues = fp.map(fp.instantiate(EntityValueProvider))(this.entities);
  }

  /**
   * Retrieve an entity value provider from an entity name.
   * @param {string} name Name of the entity to retrieve.
   * @returns {EntityValueProvider}
   */
  getEntity(name) {
    const provider = this._entitiesValues[name];

    if (!provider) {
      throw new Error(`Could not find an entity with the name: ${name}`);
    }

    return provider;
  }

  /**
   * Retrieve all synonyms values for an entity.
   * @param {string} entity Entity to retrieve
   * @returns {Array} Synonyms values
   */
  getSynonyms(entity) {
    return this._synonymsValues[entity] || [];
  }

  /**
   * This method will generate needed synonyms permutations to replace them by
   * text components in all intents and returns the final result.
   * @returns {Object} Intents with data processed.
   */
  getIntents() {
    const processIntentData = intentData => Object.assign({}, intentData, {
      data: intentData.data.reduce((acc, sentence) => {
        const sentenceSynonyms = sentence.filter(utils.isSynonym);

        // No synonyms, just returns now
        if (sentenceSynonyms.length === 0) {
          return acc.concat([sentence]);
        }

        // Get all synonyms values to generate permutations
        const synonymsData = sentenceSynonyms.reduce((prev, cur) => 
          Object.assign({}, prev, { 
            [cur.value]: this.getSynonyms(cur.value),
          }), {});

        // And for each permutation, replace by text elements
        return acc.concat(fp.map(permutation => {
          let idx = 0;

          return fp.map(part => utils.isSynonym(part) ? ({
            type: 'text',
            value: permutation[idx++],
          }): part)(sentence);
        })(utils.permutate(synonymsData)));
      }, []),
    });

    return fp.map(processIntentData)(this.intents);
  }

}

module.exports = Augment;
