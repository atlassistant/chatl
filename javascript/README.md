chatl: javascript flavor
===

## Installation

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

## Testing

```console
$ npm i
$ npm test
```