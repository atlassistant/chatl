from pychatl import fp, utils
from pychatl.augment import Augment

def rasa(chatl, **options):
  """Convert a chatl dataset to a rasa representation as per
  https://rasa.com/docs/rasa/1.1.4/nlu/training-data-format/
  """
  augment = Augment(chatl, True)

  def get_real_entity(name):
    type = augment.entities.get(name, {}).get('props', {}).get('type')

    if type and type in augment.entities:
      return type

    return name

  def get_regex_prop(name):
    return augment.entities.get(name, {}).get('props', {}).get('regex')

  # For rasa, we need a map of synonyms -> value
  synonyms_lookup = fp.reduce(lambda acc, synonyms, value:
    fp.append(*fp.map(lambda s: { s: value })(synonyms))(acc)
  )(augment.synonyms_values)

  def build_lookup_table(acc, _, name):
    entity_name = get_real_entity(name)

    # Entity reference to another or has regex feature, returns now
    if entity_name != name or get_regex_prop(name):
      return acc

    return fp.append({
      'name': name,
      'elements': augment.get_entity(name).all(),
    })(acc)

  def build_intent_examples(acc, intent, name):
    def build_sentence(sentence):
      entities = []

      def reduce_sentence(p, c):
        if not utils.is_entity(c):
          return p + c.get('value')

        entity_name = get_real_entity(c.get('value'))
        value = augment.get_entity(entity_name).next(c.get('variant'))

        nonlocal entities

        entities.append({
          'start': len(p),
          'end': len(p) + len(value),
          'entity': entity_name,
          'value': synonyms_lookup.get(value, value), # Check if its a synonym here
        })

        return p + value

      return {
        'intent': name,
        'text': fp.reduce(reduce_sentence, '')(sentence),
        'entities': entities,
      }

    return fp.append(*fp.map(build_sentence)(intent.get('data', [])))(acc)

  def build_entity_synonyms(acc, _, name):
    def reduce_entity(p, c):
      synonyms = augment.get_synonyms(c)

      if not synonyms:
        return p

      return fp.append({
        'value': c,
        'synonyms': synonyms,
      })(p)

    return fp.append(*fp.reduce(reduce_entity)(augment.get_entity(name).all()))(acc)

  def build_regex_features(acc, _, name):
    pattern = get_regex_prop(name)

    if pattern:
      return fp.append({
        'name': name,
        'pattern': pattern,
      })(acc)

    return acc

  return utils.merge({
    'rasa_nlu_data': {
      'common_examples': fp.reduce(build_intent_examples, [])(augment.get_intents()),
      'regex_features': fp.reduce(build_regex_features, [])(augment.entities),
      'lookup_tables': fp.reduce(build_lookup_table, [])(augment.entities),
      'entity_synonyms': fp.reduce(build_entity_synonyms, [])(augment.entities),
    },
  }, options)