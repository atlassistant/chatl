const fp = require('./fp');

/**
 * Provides a simple way to retrieve entity (and variant) values by iterating
 * on the provided set.
 */
class EntityValueProvider {

  /**
   * Constructs a nex EntityValueProvider from an entity definition.
   * If a synonyms lookup table is given, they will be retrieved as a normal
   * value when calling `next`.
   * @param {Object} entityData Entity data object
   * @param {Object} synonyms Optional synonyms lookup table
   */
  constructor(entityData, synonyms={}) {
    const variants = entityData.variants || {};

    this.indices = Object.assign({
      '_': -1,
    }, fp.map(fp.always(-1))(variants));

    const data = Object.assign({
      '_': fp.map(fp.prop('value'))(entityData.data),
    }, fp.map(fp.map(fp.prop('value')))(variants));
    
    this._values = fp.flatten(data);
    this.data = synonyms ? fp.map(d => 
      fp.reduce((pp, cc) => pp.concat(cc, (synonyms[cc] || [])))(d)
    )(data) : data;
  }

  /**
   * Retrieve the next entity value.
   * @param {string} variant Optional entity variant to retrieve.
   * @returns {string}
   */
  next(variant=null) {
    const key = variant || '_';
    const d = this.data[key];

    if (this.indices[key] >= d.length - 1) {
      this.indices[key] = -1;
    }

    this.indices[key] += 1;

    return d[this.indices[key]];
  }

  /**
   * Retrieve all valid values for this entity without synonyms.
   * @returns {Array} Array of valid values.
   */
  all() {
    return this._values;
  }
}

module.exports = EntityValueProvider;
