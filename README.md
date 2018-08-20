chatl [![npm version](https://badge.fury.io/js/chatl.svg)](https://badge.fury.io/js/chatl) ![License](https://img.shields.io/badge/License-MIT-blue.svg)
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

## Install

```console
$ npm install chatl --save
```

## Usage

### CLI

```console
$ chatl <dsl_training_filepath> [options_filepath] -g <generator>
```

### Library

You can use it with `node` or directly in client libraries with `webpack`.

```javascript
import chatl from 'chatl';

// Parsing the given dsl

chatl.parse(`%[get_forecast]
  will it rain in @[city] @[dateStart]

~[new york]
  ny
  nyc

@[dateStart](type=snips/datetime)
  at the end of the day
  tomorrow
  today

@[city]
  ~[new york]
  paris`, chatl.generators.snips);

// Will returns this object

/*{
  "language": "en",
  "entities": {
    "snips/datetime": {},
    "city": {
      "use_synonyms": true,
      "automatically_extensible": true,
      "data": [
        {
          "value": "new york",
          "synonyms": [
            "ny",
            "nyc"
          ]
        },
        {
          "value": "paris",
          "synonyms": []
        }
      ]
    }
  },
  "intents": {
    "get_forecast": {
      "utterances": [
        {
          "data": [
            {
              "text": "will it rain in "
            },
            {
              "text": "new york",
              "slot_name": "city",
              "entity": "city"
            },
            {
              "text": " "
            },
            {
              "text": "at the end of the day",
              "slot_name": "dateStart",
              "entity": "snips/datetime"
            }
          ]
        }
      ]
    }
  }
}*/

```