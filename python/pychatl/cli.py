import argparse, sys, json
from pychatl import parse
from pychatl.utils import deep_update
import pychatl.postprocess as postprocess
from .version import __version__

def main(): # pragma: no cover
  parser = argparse.ArgumentParser(description='Generates training dataset from a simple DSL.')
  parser.add_argument('--version', action='version', version='%(prog)s v' + __version__)
  parser.add_argument('files', type=str, nargs='+', help='One or more DSL files to process')
  parser.add_argument('-a', '--adapter', type=str, help='Adapter to use when post-processing outputed data')
  parser.add_argument('-o', '--options', type=str, help='Raw options to give to the post processor')
  parser.add_argument('--pretty', action='store_true', help='Pretty output')

  args = parser.parse_args(sys.argv[1:])

  parsed_data = []

  for file in args.files:
    with open(file, encoding='utf-8') as f:
      parsed_data.append(parse(f.read()))

  # Merge all processed data
  data = {}

  for d in parsed_data:
    data = deep_update(data, d)

  if args.options:
    options = json.loads(args.options)
  else:
    options = {}

  if args.adapter:
    data = getattr(postprocess, args.adapter)(data, **options)

  print (json.dumps(data, indent=2 if args.pretty else None))