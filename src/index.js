const parser = require('./parser');
const generators = require('./generators');

module.exports = {
  generators,
  /**
   * Parses raw input and output generated dataset.
   * 
   * @param {string} input Raw input DSL file
   * @param {function} generator Generator function to use (ex. chatl.generators.snips). The first argument will be the object representation of the DSL and second argument will be the raw options data
   * @param {string} options Raw options file, the generator will receive it as it
   * @return {Object} Generated dataset
   */
  parse(input, generator, options=null) {
    let result = parser.parse(input);

    if (generator) {
      result = generator(result, options);
    }

    return result;
  },
  /**
   * Handy method to call the stringifier generators which converts a chatl JSON dataset
   * to a raw string representation. This is some sort of a reverse for the parse method.
   * 
   * @param {Object} dataset chatl dataset
   * @return {string} Raw string representing the dataset
   */
  generate(dataset) {
    return generators.stringifier(dataset);
  }
};
