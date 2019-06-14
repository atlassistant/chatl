const _ = require('lodash');
const utils = require('../utils');

module.exports = (function () {
  
  function Visitor(source) {
    this.intents = source.intents || {};
    this.entities = source.entities || {};
    this.synonyms = source.synonyms || {};

    this.synonymsValues = {};
  }

  Visitor.prototype.flattenSynonyms = function () {
    return _.mapValues(this.synonyms, function (v) {
      return v.data.map(d => d.value);
    });
  };

  Visitor.prototype.processSynonymsInIntent = function (sentences) {
    let result = [];
    const self = this;

    _.each(sentences, function (sentence) {
      const sentenceSynonyms = sentence.filter(utils.isSynonym);

      if (sentenceSynonyms.length === 0) {
        result.push(sentence);
        return;
      }

      // Get all synonyms variations to request permutations
      const synonymsData = sentenceSynonyms.reduce(function (prev, cur) {
        prev[cur.value] = self.synonymsValues[cur.value] || [];

        return prev;
      }, {});

      const permutations = utils.permutate(synonymsData);
      
      result = result.concat(_.map(permutations, function (permutation) {
        let idx = 0;

        return _.map(sentence, function (d) {
          if (utils.isSynonym(d)) {
            return {
              type: 'text',
              value: permutation[idx++],
            };
          }
          return d;
        });
      }));
    });

    return result;
  }

  Visitor.prototype.process = function () {
    const self = this;

    this.synonymsValues = this.flattenSynonyms();
    this.intents = _.mapValues(this.intents, function (intent) {
      return _.assign(intent, {
        data: self.processSynonymsInIntent(intent.data),
      });
    });

    return {
      intents: this.intents,
      entities: this.entities,
      synonyms: this.synonyms,
    };
  }

  return Visitor;  
}());
