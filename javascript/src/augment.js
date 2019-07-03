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
   * @param {Boolean} useSynonymsInEntityValueProvider If sets to true, synonyms will be outputed by entity value provider using the `next` method
   */
  constructor(parsedData, useSynonymsInEntityValueProvider=false) {
    this.intents = parsedData.intents || {};
    this.entities = parsedData.entities || {};
    this.synonyms = parsedData.synonyms || {};

    // Let's flatten some stuff right now
    this._synonymsValues = fp.map(
      fp.pipe(fp.prop('data'), fp.map(fp.prop('value'))))(this.synonyms);
    this._entitiesValues = fp.map(fp.instantiate(EntityValueProvider, 
      useSynonymsInEntityValueProvider ? this._synonymsValues : {}))(this.entities);
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
   * text components in all intents and returns the final result. It will also
   * handle optional synonyms values.
   * @returns {Object} Intents with data processed.
   */
  getIntents() {
    const processIntentData = intentData => fp.append({
      data: fp.reduce((acc, sentence) => {
        const sentenceSynonyms = fp.filter(utils.isSynonym)(sentence);

        // No synonyms, just returns now
        if (sentenceSynonyms.length === 0) {
          return fp.append([sentence])(acc);
        }

        // Get all synonyms values to generate permutations
        // For optional synonyms, add an empty entry.
        const synonymsData = fp.reduce((p, c) => fp.append({
          [c.value]: (c.optional ? [''] : []).concat(this.getSynonyms(c.value)),
        })(p), {})(sentenceSynonyms);
        
        // And for each permutation, replace by text elements
        return fp.append(fp.map(permutation => {
          let idx = 0;

          const parts = fp.reduce((p, c) => {
            if (!utils.isSynonym(c)) {
              return fp.append(fp.clone(c))(p);
            }

            const value = permutation[idx++];

            // Check if it's not an empty value
            if (value) {
              return fp.append({
                type: 'text',
                value,
              })(p);
            }

            return p;
          })(sentence);

          // Trim start and end for respectively first and last elements.
          if (parts) {
            fp.pipe(fp.first, fp.set(d => d.value = d.value.trimStart()))(parts);
            fp.pipe(fp.last, fp.set(d => d.value = d.value.trimEnd()))(parts);
          }

          return parts;
        })(utils.permutate(synonymsData)))(acc);
      })(intentData.data),
    })(intentData);

    return fp.map(processIntentData)(this.intents);
  }

}

module.exports = Augment;
