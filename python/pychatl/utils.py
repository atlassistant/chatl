from collections import Mapping

def deep_update(d, u):
  """Deeply updates a dictionary. List values are concatenated.

  Args:
    d (dict): First dictionary which will be updated
    u (dict): Second dictionary use to extend the first one

  Returns:
    dict: The merge dictionary

  """

  for k, v in u.items():
    if isinstance(v, Mapping):
      d[k] = deep_update(d.get(k, {}), v)
    elif isinstance(v, list):
      existing_elements = d.get(k, [])
      d[k] = existing_elements + [ele for ele in v if ele not in existing_elements]
    else:
      d[k] = v

  return d