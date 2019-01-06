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
# For snips, `type` and `extensible` are used for example.

@[date](type=snips/datetime)
  tomorrow
  today

# Variants is used only to generate training sample with specific values that should
# maps to the same entity name, here `date`. Props will be merged with the root entity.

@[date#with_variant]
  the end of the day
  nine o clock
  twenty past five

```

## Installation

Choose your flavor and follow the lead:

- [Javascript](javascript)
- [Python](python)