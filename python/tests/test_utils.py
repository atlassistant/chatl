from sure import expect
from pychatl.utils import merge, is_synonym, is_entity, is_text


class TestUtils:

    def test_it_should_be_able_to_check_for_synonyms_nodes(self):
        expect(is_synonym({'type': 'text'})).to.be.false
        expect(is_synonym({'type': 'entity'})).to.be.false
        expect(is_synonym({'type': 'synonym'})).to.be.true

    def test_it_should_be_able_to_check_for_entity_nodes(self):
        expect(is_entity({'type': 'text'})).to.be.false
        expect(is_entity({'type': 'synonym'})).to.be.false
        expect(is_entity({'type': 'entity'})).to.be.true

    def test_it_should_be_able_to_check_for_text_nodes(self):
        expect(is_text({'type': 'entity'})).to.be.false
        expect(is_text({'type': 'synonym'})).to.be.false
        expect(is_text({'type': 'text'})).to.be.true

    def test_it_should_merge_complex_objects_correctly(self):
        a = {
            'one': 'value',
            'b': False,
            'arr': [1, 2],
            'with': {
                'nested': {
                    'prop': 'here!',
                },
            },
        }

        b = {
            'arr': [3],
            'b': False,
            'another': 'value',
            'with': {
                'nested': {
                    'arr': [1, 2],
                },
            },
        }

        c = {
            'arr': [4],
            'another': 'value overloaded',
            'b': True,
            'with': {
                'nested': {
                    'arr': [3, 4, 5, 6],
                },
            },
        }

        expect(merge(a, b, c)).to.equal({
            'one': 'value',
            'another': 'value overloaded',
            'b': True,
            'arr': [1, 2, 3, 4],
            'with': {
                'nested': {
                    'arr': [1, 2, 3, 4, 5, 6],
                    'prop': 'here!',
                },
            },
        })

    def test_it_should_merge_multiple_datasets_intelligently(self):
        a = {
            'intents': {
                'get_forecast': {
                    'props': {'some': 'prop'},
                    'data': [
                        [
                            {'type': 'text', 'value': 'will it rain in '},
                            {'type': 'entity', 'value': 'city', 'variant': None},
                        ],
                    ],
                }
            },
            'entities': {
                'city': {
                    'variants': {
                        'cityVariant': [
                            {'type': 'text', 'value': 'london'},
                            {'type': 'synonym', 'value': 'new york'},
                        ],
                    },
                    'data': [
                        {'type': 'text', 'value': 'paris'},
                        {'type': 'text', 'value': 'rouen'},
                        {'type': 'synonym', 'value': 'new york'},
                    ],
                    'props': {'some': 'entity prop'},
                },
            },
            'synonyms': {
                'new york': {
                    'props': {'syn': 'prop'},
                    'data': [
                        {'type': 'text', 'value': 'nyc'},
                    ],
                },
            },
        }

        b = {
            'intents': {
                'get_forecast': {
                    'props': {'other': 'intent prop'},
                    'data': [
                        [
                            {'type': 'text', 'value': 'will it snow in '},
                            {'type': 'entity', 'value': 'city', 'variant': None},
                        ],
                    ],
                },
            },
            'entities': {
                'city': {
                    'props': {'another': 'prop'},
                    'variants': {},
                    'data': [
                        {'type': 'text', 'value': 'new york'},
                        {'type': 'text', 'value': 'metz'},
                        {'type': 'text', 'value': 'caen'},
                        {'type': 'text', 'value': 'paris'},
                    ],
                },
            },
            'synonyms': {},
        }

        c = {
            'intents': {
                'lights_on': {
                    'props': {},
                    'data': [[{'type': 'text', 'value': 'turn the lights on'}]],
                },
            },
            'entities': {
                'city': {
                    'props': {},
                    'data': [],
                    'variants': {
                        'cityElsewhere': [{'type': 'text', 'value': 'amsterdam'}],
                        'cityVariant': [{'type': 'text', 'value': 'sydney'}],
                    },
                },
                'room': {
                    'props': {},
                    'data': [],
                    'variants': {},
                },
            },
            'synonyms': {
                'basement': {
                    'props': {},
                    'data': [{'type': 'text', 'value': 'cellar'}],
                },
                'new york': {
                    'props': {'another': 'prop'},
                    'data': [
                        {'type': 'text', 'value': 'ny'},
                        {'type': 'text', 'value': 'nyc'},
                    ],
                },
            },
        }

        expect(merge(a, b, c)).to.equal({
            'intents': {
                'get_forecast': {
                    'props': {'some': 'prop', 'other': 'intent prop'},
                    'data': [
                        [
                            {'type': 'text', 'value': 'will it rain in '},
                            {'type': 'entity', 'value': 'city', 'variant': None},
                        ],
                        [
                            {'type': 'text', 'value': 'will it snow in '},
                            {'type': 'entity', 'value': 'city', 'variant': None},
                        ],
                    ],
                },
                'lights_on': {
                    'props': {},
                    'data': [[{'type': 'text', 'value': 'turn the lights on'}]],
                },
            },
            'entities': {
                'city': {
                    'variants': {
                        'cityElsewhere': [{'type': 'text', 'value': 'amsterdam'}],
                        'cityVariant': [
                            {'type': 'text', 'value': 'london'},
                            {'type': 'synonym', 'value': 'new york'},
                            {'type': 'text', 'value': 'sydney'},
                        ],
                    },
                    'data': [
                        {'type': 'text', 'value': 'paris'},
                        {'type': 'text', 'value': 'rouen'},
                        {'type': 'synonym', 'value': 'new york'},
                        {'type': 'text', 'value': 'new york'},
                        {'type': 'text', 'value': 'metz'},
                        {'type': 'text', 'value': 'caen'},
                    ],
                    'props': {'some': 'entity prop', 'another': 'prop'},
                },
                'room': {
                    'props': {},
                    'data': [],
                    'variants': {},
                },
            },
            'synonyms': {
                'new york': {
                    'props': {'syn': 'prop', 'another': 'prop'},
                    'data': [
                        {'type': 'text', 'value': 'nyc'},
                        {'type': 'text', 'value': 'ny'},
                    ],
                },
                'basement': {
                    'props': {},
                    'data': [{'type': 'text', 'value': 'cellar'}],
                },
            },
        })
