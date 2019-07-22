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

  $ pychatl .\example\forecast.dsl .\example\lights.dsl -a snips -o '{ \"language\": \"en\" }'

From the code
~~~~~~~~~~~~~

.. code-block:: python

  from pychatl import parse

  result = parse("""
  # pychatl is really easy to understand.
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
  """)

  # Now you got a parsed dataset so you may want to process it for a specific NLU engines

  from pychatl.postprocess import snips

  snips_dataset = snips(result) # Or give options with `snips(result, language='en')`

  # And now you got your dataset ready to be fitted within snips-nlu!

Testing
-------

.. code-block:: bash

  $ pip install -e .[test]
  $ python -m nose --with-doctest --with-coverage --cover-package=pychatl
