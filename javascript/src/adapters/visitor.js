const _ = require('lodash');
const utils = require('../utils');

function always(d) { return function () { return d; } }
function value(d) { return d.value }
function mapValue(d) { return d.map(value); }

const EntityValueProvider = (function (){
  function EntityValueProvider(entity) {
    this.indices = _.assign({
      '_': -1,
    }, _.mapValues(entity.variants, always(-1)));

    this.data = _.assign({
      '_': entity.data.map(value),
    }, _.mapValues(entity.variants, mapValue));
  }

  EntityValueProvider.prototype.next = function (variant) {
    const key = variant || '_';
    const d = this.data[key];

    if (this.indices[key] >= d.length - 1) {
      this.indices[key] = -1;
    }

    this.indices[key] += 1;

    return d[this.indices[key]];
  }

  return EntityValueProvider;
}());

function flattenSynonyms(synonyms) {
  return _.mapValues(synonyms, function (v) {
    return v.data.map(d => d.value);
  });
}

function buildEntityValueProviders(entities) {
  return _.mapValues(this.entities, function (e) { 
    return new EntityValueProvider(e);
  });
}

const Visitor = (function () {
  
  function Visitor(source) {
    this.intents = source.intents || {};
    this.entities = source.entities || {};
    this.synonyms = source.synonyms || {};

    // Build some stuff to ease the process
    this.synonymsValues = flattenSynonyms(this.synonyms);
    this.entitiesValues = buildEntityValueProviders(this.entities);
  }

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

module.exports = {
  flattenSynonyms,
  Visitor,
  EntityValueProvider,
};
