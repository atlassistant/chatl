import functools, itertools

def map(func):
  """Apply a function on all elements. It can also be used on objects for which 
  it will map on object values but keep keys.

  Args:
    func (callable): Callback to apply on each elements

  """
  def cb(d):
    if isinstance(d, list):
      return [ func(v) for v in d]
    else:
      return { k: func(v) for k, v in d.items() }
  return cb

def reduce(func, start=None):
  """Reduce an array or an object.

  Args:
    func (callable): Function to use when reducing the object.
    start (any): Accumulator default state

  """
  def cb(d):
    if isinstance(d, list):
      return functools.reduce(func, d,
        start if start is not None else [])
    else:
      return functools.reduce(lambda p, c: func(p, d[c], c), d.keys(),
        start if start is not None else {}) 
  return cb

def clone(o):
  """Clone an object.

  Args:
    o (dict): Dictionary to clone
  
  """
  return {}.update(o) or o

def always(value):
  """Always returns the given value, used mostly for initialisation.

  Args:
    value (any): Value to return

  """
  def cb(d):
    return value
  return cb

def prop(name):
  """Retrieve an object property.

  Args:
    name (str): Name of the property to retrieve
  
  """
  def cb(o):
    return o.get(name)
  return cb

def filter(func):
  """Filter an array.

  Args:
    func (callable): Function for filtering

  """
  def cb(d):
    return [v for v in d if func(v)]
  return cb

def flatten(d):
  """Flatten an array or an object values.

  Args:
    d (list or dict): List or dict to flatten

  """
  seq = d if isinstance(d, list) else d.values()
  return functools.reduce(lambda p, c: p + c, seq, [])

def append(*v):
  """Mostly used with reduce, append one or more elements to an array or an object.

  Args:
    v (list): Values to append

  """
  def cb(d):
    # TODO may need optimization :/
    if isinstance(d, list):
      r = []
      r.extend(d)
      r.extend(v)
      return r
    else:
      r = {}
      r.update(d)
      for i in v:
        r.update(i)
      return r
  return cb

def instantiate(klass, *args):
  """Instantiate a class.

  Args:
    klass (class): Class to instantiate
    args (any): Args to provide to the constructor along with the current value

  """
  def cb(d):
    return klass(d, *args)
  return cb

def pipe(*functions):
  """Returns a function which pipe the given ones.

  Args:
    functions (list of callable): Functions to chain

  """
  def cb(d):
    return functools.reduce(lambda arg, func: func(arg), functions, d)

  return cb