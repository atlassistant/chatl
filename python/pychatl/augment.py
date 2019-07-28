from itertools import product
from pychatl import fp
from pychatl.entity_value_provider import EntityValueProvider
from pychatl.utils import is_synonym

class Augment:
  """The augment class provide helpers methods to augment a chatl parsed data
  tree and make the process of writing adapters easier.
  """
  
  def __init__(self, parsed_data, use_synonyms_in_entity_value_provider=False):
    """Instantiate a new augment object with the given data.

    Args:
      parsed_data (dict): Chatl parsed data
      use_synonyms_in_entity_value_provider (bool): If sets to true, synonyms will be outputed by entity value provider using the `next` method

    """
    self.intents = parsed_data.get('intents', {})
    self.entities = parsed_data.get('entities', {})
    self.synonyms = parsed_data.get('synonyms', {})

    # Let's flatten some stuff right now
    self.synonyms_values = fp.map(fp.pipe(fp.prop('data'), fp.map(fp.prop('value'))))(self.synonyms)
    self.entities_values = fp.map(fp.instantiate(EntityValueProvider, 
        self.synonyms_values if use_synonyms_in_entity_value_provider else {}))(self.entities)

  def get_entity(self, name):
    """Retrieve an entity value provider from an entity name.

    Args:
      name (str): Name of the entity to retrieve

    Returns:
      EntityValueProvider: The EntityValueProvider for this entity

    """
    provider = self.entities_values.get(name)

    if not provider:
      raise Exception(f'Could not find an entity with the name: {name}')

    return provider

  def get_synonyms(self, entity):
    """Retrieve all synonyms values for an entity.

    Args:
      entity (str): Entity to retrieve
    
    Returns:
      list of str: Synonyms values

    """
    return self.synonyms_values.get(entity, [])

  def get_intents(self):
    """This method will generate needed synonyms permutations to replace them by
    text components in all intents and returns the final result. It will also
    handle optional synonyms values.

    Returns:
      dict: Intents with data processed

    """
    # This whole method is quite complicated and can probably be optimized.
    # We have to isolate intent sentences which contains synonyms, then we
    # generate permutations and take care of optional synonyms.
    # Optional synonyms may introduce unneeded spaces, that's why there's a
    # second step which try to eliminate them.

    def process_sentence_data(acc, sentence):
      sentence_synonyms = fp.filter(is_synonym)(sentence)

      # No synonyms, just returns now
      if not sentence_synonyms:
        return fp.append(sentence)(acc)

      # Get all synonyms values to generate permutations
      # For optional synonyms, add an empty entry.
      def reduce_synonyms(p, synonym_data):
        return fp.append(([''] if synonym_data.get('optional') else []) + self.get_synonyms(synonym_data['value']))(p)

      synonyms_data = fp.reduce(reduce_synonyms)(sentence_synonyms)

      def process_permutation(permutation):
        idx = 0

        def reduce_sentence(p, c):
          if not is_synonym(c):
            return fp.append(fp.clone(c))(p)
          
          nonlocal idx

          value = permutation[idx]
          idx += 1

          # Check if it's not an empty value
          if value:
            return fp.append({
              'type': 'text',
              'value': value,
            })(p)

          return p

        parts = fp.reduce(reduce_sentence)(sentence)
        part_idx = 0

        def reduce_whitespaces_in_part(f, part):
          p = fp.clone(part)

          nonlocal part_idx

          # First element
          if part_idx == 0:
            p['value'] = p['value'].lstrip()

          # Last element or the following one starts with a space
          if part_idx == (len(parts) - 1) or parts[part_idx + 1]['value'][0] == ' ':
            p['value'] = p['value'].rstrip()

          part_idx += 1

          if not p['value']:
            return f

          return fp.append(p)(f)

        # Remove uneeded whitespaces introduced by optional synonyms
        stripped_parts = fp.reduce(reduce_whitespaces_in_part)(parts)

        return stripped_parts

      return fp.append(*fp.map(process_permutation)(list(product(*synonyms_data))))(acc)

    def process_intent_data(intent_data):
      return fp.append({
        'data': fp.reduce(process_sentence_data)(intent_data.get('data', [])),
      })(intent_data)

    return fp.map(process_intent_data)(self.intents)