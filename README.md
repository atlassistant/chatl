chatl [![Build Status](https://travis-ci.org/atlassistant/chatl.svg?branch=master)](https://travis-ci.org/atlassistant/chatl) [![npm version](https://badge.fury.io/js/chatl.svg)](https://badge.fury.io/js/chatl) [![pypi version](https://badge.fury.io/py/pychatl.svg)](https://badge.fury.io/py/pychatl) ![License](https://img.shields.io/badge/License-MIT-blue.svg)
===

Tiny DSL used to generates training dataset for NLU engines (currently `snips-nlu`). Heavily inspired by [chatito](https://github.com/rodrigopivi/Chatito).

## DSL specifications

```
# chatl is really easy to understand.
#
# You can defines:
#   - Intents
#   - Entities (with or without variants)
#   - Synonyms
#   - Comments (only at the top level)

# Inside an intent, you got training data.
# Training data can refer to one or more entities and/or synonyms, they will be used
# by generators to generate all possible permutations and training samples.

%[my_intent]
  ~[greet] some training data @[date]
  another training data that uses an @[entity] at @[date#with_variant]

~[greet]
  hi
  hello

# Entities contains available samples and could refer to a synonym.

@[entity]
  some value
  other value
  ~[a synonym]

# Synonyms contains only raw values

~[a synonym]
  possible synonym
  another one

# Entities and intents can define arbitrary properties that will be made available
# to generators.
# For snips, `type`, `extensible` and `strictness` are used for example.
# If the type value could not be found in the entities declaration, it will assume its a builtin one
# and on snips, it will prepend the 'snips/' automatically

@[date](type=datetime)
  tomorrow
  today

# Variants is used only to generate training sample with specific values that should
# maps to the same entity name, here `date`. Props will be merged with the root entity.

@[date#with_variant]
  the end of the day
  nine o clock
  twenty past five

```

## Adapters

For now, only the [snips adapter](https://github.com/snipsco/snips-nlu) has been done. Here is a list of adapters and their respective properties:

|  adapter       | snips |
|----------------|-------|
|  type (1)      | ✔️     |
| extensible (2) | ✔️     |
| strictness (3) | ✔️     |

1. Specific type of the entity to use (such as datetime, temperature and so on), if the given entity name could not be found in the chatl declaration, it will assume its a builtin one
2. Are values outside of training samples allowed?
3. Parser threshold

## Installation

Choose your flavor and follow the lead:

- [Javascript](javascript)
- [Python](python)