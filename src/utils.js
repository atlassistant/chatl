function permutate(currentVals, remainingAttrs) {
  let permutations = [];

  remainingAttrs[Object.keys(remainingAttrs)[0]].forEach((attrVal) => {
    const currentValsNew = currentVals.slice(0);
    currentValsNew.push(attrVal);

    if (Object.keys(remainingAttrs).length > 1) {
      const remainingAttrsNew = JSON.parse(JSON.stringify(remainingAttrs));
      delete remainingAttrsNew[Object.keys(remainingAttrs)[0]];

      permutations = permutations.concat(permutate(currentValsNew, remainingAttrsNew));
    } else {
      permutations.push(currentValsNew);
    }
  });

  return permutations;
}

module.exports = {
  permutate,
};
