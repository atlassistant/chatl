const fp = require('./fp');

/**
 * Provides a simple way to retrieve entity (and variant) values by iterating
 * on the provided set.
 */
class EntityValueProvider {

  /**
   * Constructs a nex EntityValueProvider from an entity definition.
   * @param {Object} entityData Entity data object
   */
  constructor(entityData) {
    const variants = entityData.variants || {};

    this.indices = Object.assign({
      '_': -1,
    }, fp.map(fp.always(-1))(variants));

    this.data = Object.assign({
      '_': fp.map(fp.prop('value'))(entityData.data),
    }, fp.map(fp.map(fp.prop('value')))(variants));
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
   * Retrieve all valid values for this entity.
   * @returns {Array} Array of valid values.
   */
  all() {
    return fp.flatten(this.data);
  }
}

module.exports = EntityValueProvider;
