from pychatl import fp

class EntityValueProvider:
  """Provides a simple way to retrieve entity (and variant) values by iterating
  on the provided set.
  """

  def __init__(self, entity_data, synonyms=None):
    """Constructs a nex EntityValueProvider from an entity definition.
    If a synonyms lookup table is given, they will be retrieved as a normal
    value when calling `next`.

    Args:
      entity_data (dict): Dictionary of entity informations
      synonyms (dict): Optional synonyms lookup table

    """
    variants = entity_data.get('variants', {})

    self.indices = fp.append(fp.map(fp.always(-1))(variants))({
      '_': -1,
    })

    data = fp.append(fp.map(fp.map(fp.prop('value')))(variants))({
      '_': fp.map(fp.prop('value'))(entity_data.get('data', [])),
    })
    
    self._values = fp.flatten(data)
    self.data = fp.map(lambda d: 
      fp.reduce(lambda pp, cc: fp.append(cc, *(synonyms.get(cc, [])))(pp))(d)
    )(data) if synonyms else data

  def __eq__(self, other):
    if isinstance(other, self.__class__):
      return self._values == other._values and self.data == other.data and self.indices == other.indices
    return False

  def next(self, variant=None):
    """Retrieve the next entity value.

    Args:
      variant (str): Optional entity variant to retrieve
    
    Returns:
      str: Value!

    """
    key = variant or '_'
    d = self.data[key]

    if (self.indices[key] >= len(d) - 1):
      self.indices[key] = -1

    self.indices[key] += 1

    return d[self.indices[key]]

  def all(self):
    """Retrieve all valid values for this entity without synonyms.

    Returns:
      list of str: List of values

    """
    return self._values