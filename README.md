chatl [![Build Status](https://travis-ci.org/atlassistant/chatl.svg?branch=master)](https://travis-ci.org/atlassistant/chatl) [![codecov](https://codecov.io/gh/atlassistant/chatl/branch/master/graph/badge.svg)](https://codecov.io/gh/atlassistant/chatl) [![npm version](https://badge.fury.io/js/chatl.svg)](https://badge.fury.io/js/chatl) [![pypi version](https://badge.fury.io/py/pychatl.svg)](https://badge.fury.io/py/pychatl) [![License](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
===

Tiny DSL used to generates training dataset for NLU engines (currently `snips-nlu` and `rasa nlu`). Heavily inspired by [chatito](https://github.com/rodrigopivi/Chatito).

## DSL specifications

```
# The chatl syntax is easy to understand.
# With the `%` symbol, you define intents. Intent data can contains entity references
# with the `@` and optional (using `?` as a suffix) synonyms with `~`.
# Synonyms here will be used to generate variations of the given sentence.
%[get_weather]
  ~[greet?] what's the weather like in @[city] @[date]
  ~[greet] will it rain in @[city] at @[date#hour]

# With the `~`, you define synonyms used in intents and entities definitions.
~[greet]
  hi
  hey

~[new york]
  ny
  nyc
  the big apple

# With the `@`, you define entities.
@[city]
  paris
  rouen
  ~[new york]

# You can define properties on intents, entities and synonyms.
# Depending on the dataset you want to generate, some props may be used
# by the adapter to convey specific meanings.
@[date](type=datetime, another=`property backticked`)
  tomorrow
  this weekend
  this evening

# You can define entity variants with the `#` symbol. Variants will be merge with
# the entity it references but is used to provide different values when
# generating intent sentences.
@[date#hour]
  ten o'clock
  noon

```

## Adapters

For now, only the [snips adapter](https://github.com/snipsco/snips-nlu) and [rasa nlu](https://github.com/RasaHQ/rasa) has been done. Here is a list of adapters and their respective properties:

|  adapter       | snips | rasa |
|----------------|-------|------|
| type (1)       | ✔️     | ✔️   |
| extensible (2) | ✔️     | ❌   |
| strictness (3) | ✔️     | ❌   |
| regex (4)      | ️️❌️     | ✔️   |

1. Specific type of the entity to use (such as datetime, temperature and so on). For `snips`, if the given entity name could not be found in the chatl declaration, it will assume its a builtin one (supported types are [listed here](https://github.com/snipsco/snips-nlu-ontology#supported-builtin-entities) without the `snips/` prefix). For `rasa`, it will use the referenced type as the slot name.
2. Are values outside of training samples allowed?
3. Parser threshold
4. Regex pattern used to help the NLU to extract stuff

## Installation

Choose your flavor and follow the lead:

- [Javascript](javascript)
- [Python](python)
