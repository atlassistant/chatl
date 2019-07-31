import argparse, json, sys
from pychatl import parse
from pychatl.utils import merge
import pychatl.adapters as adapters
from pychatl.version import __version__

def main(): # pragma: no cover
  parser = argparse.ArgumentParser(description='Generates training dataset from a simple DSL.')
  parser.add_argument('--version', action='version', version='%(prog)s v' + __version__)
  parser.add_argument('files', type=str, nargs='+', help='One or more DSL files to process')
  parser.add_argument('-a', '--adapter', type=str, help='Name of the adapter to use')
  parser.add_argument('-m', '--merge', type=str, help='Options file to merge with the final result')
  parser.add_argument('--pretty', action='store_true', help='Pretty output')

  args = parser.parse_args(sys.argv[1:])

  data = {}

  for file in args.files:
    with open(file, encoding='utf-8') as f:
      data = merge(data, parse(f.read()))

  if args.merge:
    options = json.loads(args.merge)
  else:
    options = {}

  if args.adapter:
    data = getattr(adapters, args.adapter)(data, **options)

  print (json.dumps(data, indent=2 if args.pretty else None))