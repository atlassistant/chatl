# pylint: disable=C0111

from pychatl import fp, utils
from pychatl.augment import Augment


def rasa(chatl, **options):
    """Convert a chatl dataset to a rasa representation as per
    https://rasa.com/docs/rasa/1.1.4/nlu/training-data-format/
    """
    augment = Augment(chatl, True)

    def get_real_entity(name):
        entity_type = augment.entities.get(name, {}).get('props', {}).get('type')

        if entity_type and entity_type in augment.entities:
            return entity_type

        return name

    def get_regex_prop(name):
        return augment.entities.get(name, {}).get('props', {}).get('regex')

    # For rasa, we need a map of synonyms -> value
    synonyms_lookup = fp.reduce(lambda acc, synonyms, value:
                                fp.append(
                                    *fp.map(lambda s: {s: value})(synonyms))(acc)
                                )(augment.synonyms_values)

    def build_lookup_table(acc, _, name):
        entity_name = get_real_entity(name)

        # Entity has regex feature, returns now
        if get_regex_prop(entity_name):
            return acc

        return fp.append({
            'name': name,
            'elements': augment.get_entity(entity_name).all(),
        })(acc)

    def build_intent_examples(acc, intent, name):
        def build_sentence(sentence):
            entities = []

            def reduce_sentence(result, cur):
                if not utils.is_entity(cur):
                    return result + cur.get('value')

                entity_name = get_real_entity(cur.get('value'))
                value = augment.get_entity(entity_name).next(cur.get('variant'))

                nonlocal entities

                entities.append({
                    'start': len(result),
                    'end': len(result) + len(value),
                    'entity': cur.get('value'),
                    # Check if its a synonym here
                    'value': synonyms_lookup.get(value, value),
                })

                return result + value

            return {
                'intent': name,
                'text': fp.reduce(reduce_sentence, '')(sentence),
                'entities': entities,
            }

        return fp.append(*fp.map(build_sentence)(intent.get('data', [])))(acc)

    def build_entity_synonyms(acc, _, name):
        def reduce_entity(result, cur):
            synonyms = augment.get_synonyms(cur)

            if not synonyms:
                return result

            return fp.append({
                'value': cur,
                'synonyms': synonyms,
            })(result)

        return fp.append(*fp.reduce(reduce_entity)(augment.get_entity(name).all()))(acc)

    def build_regex_features(acc, _, name):
        pattern = get_regex_prop(get_real_entity(name))

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
