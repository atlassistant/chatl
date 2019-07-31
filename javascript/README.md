chatl: javascript flavor
===

## Installation

```console
$ npm install -g chatl
```

## Usage

### CLI

```console
Usage: chatl [options] <files...>

  Options:

    -V, --version           output the version number
    -a, --adapter <name>    Name of the adapter to use
    -m --merge <mergeFile>  Options file to merge with the final result
    -h, --help              output usage information
```

### Library

You can use it with `node` or directly in client libraries with `webpack`.

```javascript
import chatl from 'chatl';

// Parsing the given dsl to a chatl representation

const result = chatl.parse(`
%[get_forecast]
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
  paris`);

// And convert it to the snips equivalent using the adapter
chatl.adapters.snips(result);
```

## Testing

```console
$ npm i
$ npm test # or `npm run wintest` on windows
```