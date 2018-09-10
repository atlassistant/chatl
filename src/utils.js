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

module.exports = {
  permutate,
};
