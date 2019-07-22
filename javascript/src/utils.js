/**
 * Generates all possible permutations.
 * 
 * @param {Object} remainingAttrs Object to use to generates permutations
 * @param {Array} currentVals Current values
 * @returns {Array} All possible permutations
 */
function permutate(remainingAttrs, currentVals = []) {
  let permutations = [];

  remainingAttrs[Object.keys(remainingAttrs)[0]].forEach((attrVal) => {
    const currentValsNew = currentVals.slice(0);
    currentValsNew.push(attrVal);

    if (Object.keys(remainingAttrs).length > 1) {
      const remainingAttrsNew = JSON.parse(JSON.stringify(remainingAttrs));
      delete remainingAttrsNew[Object.keys(remainingAttrs)[0]];

      permutations = permutations.concat(permutate(remainingAttrsNew, currentValsNew));
    } else {
      permutations.push(currentValsNew);
    }
  });

  return permutations;
}

/**
 * Recursively merge an object into another and concat arrays.
 * @param {any} destination Where to merge
 * @param {any} source Source object to merge
 */
function rmerge(destination, source) {
  if (Array.isArray(source)) {
    destination = destination.concat(source);
  } else if (typeof source === 'object') {
    Object.keys(source).map(key => {
      if (typeof destination[key] !== 'undefined') {
        destination[key] = rmerge(destination[key], source[key]);
      } else {
        destination[key] = source[key];
      }
    });
  } else {
    destination = source;
  }

  return destination;
}

/**
 * Merge multiple source objects into the destination sharing the same structure.
 * @param {Object} destination Destination object
 * @param  {...Object} sources Source objects to merge
 */
function mergeObjects(destination, ...sources) {
  return sources.reduce((result, source) => {
    return rmerge(result, source);
  }, destination);
}

/**
 * Fix JSON number serializing by always add a decimal when needed since
 * float does not really exists in Javascript and snips (for example) need numbers
 * to be valid floats.
 * @param {Object} dataset Dataset to stringify
 * @returns {String}
 */
function toJSON(dataset) {
  const str = JSON.stringify(dataset, null, 2);

  return str.replace(/"(.*)": ?([0-9]*[^.,{[])(,)?$/gm, '"$1": $2.0$3');
}

/**
 * Check if the given element is a synonym.
 * @param {Object} ele Element to check
 * @returns {Boolean}
 */
const isSynonym = (ele) => ele.type === 'synonym';

/**
 * Check if the given element is an entity.
 * @param {Object} ele Element to check
 * @returns {Boolean}
 */
const isEntity = (ele) => ele.type === 'entity';

/**
 * Check if the given element is a text.
 * @param {Object} ele Element to check
 * @returns {Boolean}
 */
const isText = (ele) => ele.type === 'text';

module.exports = {
  permutate,
  toJSON,
  isSynonym,
  isText,
  isEntity,
  mergeObjects,
};
