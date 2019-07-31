from pychatl import fp, utils
from pychatl.augment import Augment

SNIPS_PREFIX = 'snips/'

def snips(chatl, **options):
  """Transform a chatl dataset to a snips representation as per 
  https://snips-nlu.readthedocs.io/en/0.19.1/dataset.html
  """
  augment = Augment(chatl)

  def get_entity_type(entity):
    type = entity.get('props', {}).get('type') or entity.get('props', {}).get('snips:type')

    # If the type is not present in the dataset, let's consider it'a a built-in
    # one.
    if type and not augment.entities.get(type):
      return SNIPS_PREFIX + type if SNIPS_PREFIX not in type else type

    return type

  def build_entity(acc, entity, name):
    type = get_entity_type(entity)

    if type:
      if SNIPS_PREFIX in type:
        return fp.append({ 
          type: {},
        })(acc)

      # It has a type present in the dataset, it should be considered as a slot
      return acc

    use_synonyms = False

    def build_entity_value(e):
      nonlocal use_synonyms
      synonyms = augment.get_synonyms(e)
      use_synonyms = use_synonyms or len(synonyms) > 0
      return {
        'value': e,
        'synonyms': synonyms,
      }

    values = fp.map(build_entity_value)(augment.get_entity(name).all())

    return fp.append({
      name: {
        'data': values,
        'automatically_extensible': entity['props'].get('extensible', 'true') == 'true',
        'matching_strictness': float(entity['props'].get('strictness', '1')),
        'use_synonyms': use_synonyms,
      },
    })(acc)

  def build_sentence_part(part):
    part_value = part.get('value')

    if not utils.is_entity(part):
      return { 'text': part_value }

    entity = augment.entities.get(part_value)
    # Retrieve the inner type of the entity if defined in the dataset
    type = get_entity_type(entity) or part_value
    # And check if it references another defined entity because if it's true,
    # values will be fetched from here
    referenced_entity = type if augment.entities.get(type) else part_value

    return {
      'entity': type,
      'slot_name': part_value,
      'text': augment.get_entity(referenced_entity).next(part.get('variant')),
    }

  def build_intents(intent):
    return {
      'utterances': fp.map(lambda sentence: {
        'data': fp.map(build_sentence_part)(sentence),
      })(intent.get('data', [])),
    }

  return utils.merge({
    'language': 'en',
    'intents': fp.map(build_intents)(augment.get_intents()),
    'entities': fp.reduce(build_entity)(augment.entities),
  }, options)
