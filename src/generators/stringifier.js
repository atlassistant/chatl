const _ = require('lodash');
const EOL = '\n';

function generateProps(props) {
  let propsStr = '';

  if (!_.isEmpty(props)) {
    propsStr = `(${Object.keys(props).map(o => `${o}=${props[o]}`).join(',')})`;
  }

  return propsStr;
}

function wrap(data) {
  switch (data.type) {
    case 'entity':
      if (data.variant) {
        return `@[${data.value}#${data.variant}]${generateProps(data.props)}`;  
      }

      return `@[${data.value}]${generateProps(data.props)}`;
    case 'synonym':
      return `~[${data.value}]`;
    case 'intent':
      return `%[${data.value}]${generateProps(data.props)}`;
    default:
      return data.value;
  }
}

function generateSentence(data) {
  if (Array.isArray(data)) {
    return data.map(o => generateSentence(o)).join('');
  } else if (data.type) {
    return wrap(data);
  } else {
    if (data.synonyms.length && data.synonyms.length > 0) {
      return `~[${data.value}]`;
    }

    return data.value;
  }
}

function generateEntity(name, data) {
  let result = `${wrap({ type: 'entity', value: name, ...data })}
${data.data.map(o => '  ' + generateSentence(o)).join(EOL)}
`;

  if (!_.isEmpty(data.variants)) {
    result += EOL + Object.keys(data.variants).map(o => generateEntity(`${name}#${o}`, { data: data.variants[o] })).join(EOL);
  }

  return result;
}

function generateIntent(name, data) {
  return `${wrap({ type: 'intent', value: name, ...data })}
${data.data.map(o => '  ' + generateSentence(o)).join(EOL)}
`;
}

function generateSynonym(name, data) {
  return `${wrap({ type: 'synonym', value: name, ...data })}
${data.map(o => '  ' + o).join(EOL)}
`;
}

module.exports = {
  process (data, options) {
    return `${Object.keys(data.intents).map(o => generateIntent(o, data.intents[o])).join(EOL)}
${Object.keys(data.entities).map(o => generateEntity(o, data.entities[o])).join(EOL)}
${Object.keys(data.synonyms).map(o => generateSynonym(o, data.synonyms[o])).join(EOL)}`;
  },
  wrap,
  generateIntent,
  generateProps,
  generateEntity,
  generateSynonym,
  generateSentence,
}