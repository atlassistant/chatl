# pylint: disable=E0611

"""Defines utilities methods.
"""

from collections import Mapping


def merge(destination, *sources):
    """Deeply updates a dictionary. List values are concatenated.

    Args:
      destination (dict): First dictionary which will be updated
      sources (list of dict): One or more dictionary use to extend the destination

    Returns:
      dict: The merged dictionary

    """

    for source in sources:
        for k, val in source.items():
            if isinstance(val, Mapping):
                destination[k] = merge(destination.get(k, {}), val)
            elif isinstance(val, list):
                existing_elements = destination.get(k, [])
                destination[k] = existing_elements + \
                    [ele for ele in val if ele not in existing_elements]
            else:
                destination[k] = val

    return destination


def is_synonym(ele):
    """Check if the given element is a synonym.

    Args:
      ele (dict): Element to check

    Returns:
      bool: True if yes, false otherwise

    """
    return ele.get('type') == 'synonym'


def is_entity(ele):
    """Check if the given element is an entity.

    Args:
      ele (dict): Element to check

    Returns:
      bool: True if yes, false otherwise

    """
    return ele.get('type') == 'entity'


def is_text(ele):
    """Check if the given element is a text.

    Args:
      ele (dict): Element to check

    Returns:
      bool: True if yes, false otherwise

    """
    return ele.get('type') == 'text'
