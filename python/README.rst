chatl: python flavor
====================

Installation
------------

pip
~~~

.. code-block:: bash

  $ pip install pychatl

source
~~~~~~

.. code-block:: bash

  $ git clone https://github.com/atlassistant/chatl.git
  $ cd chatl/python
  $ python setup.py install

or

.. code-block:: bash

  $ pip install -e .

Usage
-----

From the terminal
~~~~~~~~~~~~~~~~~

.. code-block:: bash

  usage: pychatl [-h] [--version] [-a ADAPTER] [-m MERGE] [--pretty]
               files [files ...]

  Generates training dataset from a simple DSL.

  positional arguments:
    files                 One or more DSL files to process

  optional arguments:
    -h, --help            show this help message and exit
    --version             show program's version number and exit
    -a ADAPTER, --adapter ADAPTER
                          Name of the adapter to use
    -m MERGE, --merge MERGE
                          Options file to merge with the final result
    --pretty              Pretty output

From the code
~~~~~~~~~~~~~

.. code-block:: python

  from pychatl import parse

  result = parse("""
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
    paris
  """)

  # Now you got a parsed dataset so you may want to process it for a specific NLU engines

  from pychatl.adapters import snips

  snips_dataset = snips(result) # Or give options with `snips(result, language='en')`

  # And now you got your dataset ready to be fitted within snips-nlu!

Testing
-------

.. code-block:: bash

  $ pip install -e .[test]
  $ python -m nose --with-doctest --with-coverage --cover-package=pychatl
