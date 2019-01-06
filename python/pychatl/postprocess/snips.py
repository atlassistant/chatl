from itertools import product
from ..utils import deep_update
import logging

SNIPS_PREFIX = 'snips/'

def snips(dataset, **options):

  entities_idx = {}

  entities = dataset.get('entities', {})
  intents = dataset.get('intents', {})
  synonyms = dataset.get('synonyms', {})

  def get_entity_type_backport(entity_props):
    """Retrieve the entity type for given entity properties.

    It also handle the soon to be obsolete nature of using the snips:type and
    encourage you to use the type= syntax where you should leave the snips/ prefix away.

    It will be added if the entity type can not be found in declared entities.
    
    """

    prop_type = entity_props.get('type')
    snips_type = entity_props.get('snips:type')

    if snips_type:
      prop_type = snips_type.replace(SNIPS_PREFIX, '')
      logging.warning('snips:type has been replaced by type. You should now leave the snips/ prefix away when using it')

    if prop_type and prop_type not in entities and SNIPS_PREFIX not in prop_type:
      return SNIPS_PREFIX + prop_type

    return prop_type

  def get_entity_or_variant_value(entity, variant):
    ed = entities.get(entity, {})
    prop_type = get_entity_type_backport(ed.get('props', {}))
    
    # If it refers to another entity, use their values instead
    if prop_type in entities:
      entity = prop_type
      ed = entities.get(entity, {})

    d = ed.get('data', [])
    key = entity + (variant or '')

    if variant:
      d = ed.get('variants', {}).get(variant, [])

    if key not in entities_idx or entities_idx[key] >= (len(d) - 1):
      entities_idx[key] = 0
    else:
      entities_idx[key] += 1
    
    return d[entities_idx[key]].get('value')

  def get_sentence_value(raw_data):
    t = raw_data.get('type', 'text')
    v = raw_data.get('value')

    if t == 'text':
      return { 
        'text': v,
      }
    elif t == 'entity':
      return {
        'text': get_entity_or_variant_value(v, raw_data.get('variant')),
        'slot_name': v,
        'entity': get_entity_type_backport(entities.get(v, {}).get('props', {})) or v,
      }

    return {}

  training_dataset = {
    'language': 'en',
    'intents': {},
    'entities': {},
  }

  # Process entities first
  
  for (name, entity) in entities.items():
    # Here we flatten the variants data
    variants_value = list(entity.get('variants', {}).values())
    variants_data = [item for sublist in variants_value for item in sublist]

    entity_data = entity.get('data', []) + variants_data
    props = entity.get('props', {})
    prop_type = get_entity_type_backport(props)

    if not prop_type:
      data = []
      use_synonyms = False

      for d in entity_data:
        t = d.get('type', 'text')
        v = d.get('value')

        if t == 'text':
          data.append({
            'value': v,
            'synonyms': [],
          })
        elif t == 'synonym':
          synonyms = dataset.get('synonyms', {}).get(v, {}).get('data', [])
          use_synonyms = True

          data.append({
            'value': v,
            'synonyms': [s.get('value') for s in synonyms],
          })

      training_dataset['entities'][name] = {
        'data': data,
        'use_synonyms': use_synonyms,
        'automatically_extensible': (props.get('extensible', 'true') == 'true'),
        'matching_strictness': float(props.get('strictness', '1')),
      }
    elif prop_type not in entities:
      training_dataset['entities'][prop_type] = {}     

  # And then intents
  # For intents, we need to generate all permutations for synonyms

  for (name, intent) in intents.items():
    intent_data = intent.get('data', [])
    utterances = []

    for sentence in intent_data:
      synonyms_in_sentence = list(filter(lambda d: d.get('type') == 'synonym', sentence))

      if len(synonyms_in_sentence) > 0:
        synonym_values = [[d.get('value') for d in synonyms.get(s.get('value'), {}).get('data', [])] for s in synonyms_in_sentence]
        
        permutations = product(*synonym_values)

        for permutation in permutations:
          cur_sentence = []
          permut_idx = 0

          for data in sentence:
            if data.get('type') == 'synonym':
              data = {
                'type' : 'text',
                'value': permutation[permut_idx],
              }

              permut_idx += 1
            
            cur_sentence.append(get_sentence_value(data))
          
          utterances.append({
            'data': cur_sentence,
          })
            
      else:
        utterances.append({
          'data': [ get_sentence_value(d) for d in sentence ],
        })
    
    training_dataset['intents'][name] = {
      'utterances': utterances,
    }

  return deep_update(training_dataset, options)