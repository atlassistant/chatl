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

module.exports = {
  permutate,
  toJSON,
};
