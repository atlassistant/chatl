from arpeggio import PTNodeVisitor
from arpeggio.cleanpeg import ParserPEG, visit_parse_tree

parser = ParserPEG("""
root = (intent_definition / entity_definition / synonym_definition / comment / EOL)+

EOL = r'\\n|\\r'
indent = r'[ \\t]*'
sentence = r'[^@^~^%^#^\\n^\\r]+'
text = r'[^\\n^\\r]*'

element_name = r'[^]^?]+'

entity_alias = "@[" element_name "]"
synonym_alias = "~[" element_name "]"

prop_key = r'[^=^\\n^\\r]*'
backticked_value = r'[^\\n^\\r^`]*'
prop_value = "`" backticked_value "`" / r'[^,^)^\\n^\\r]*'
prop = prop_key "=" prop_value indent r'[,]?' indent
props = "(" prop+ ")"

entity_data = indent (synonym_alias / sentence) EOL?
entity_definition = "@[" element_name "]" props? EOL
  entity_data*

optional = "?"
intent_synonym = "~[" element_name optional? "]"
intent_data = indent (entity_alias / intent_synonym / sentence)+ EOL?
intent_definition = "%[" element_name "]" props? EOL
  intent_data*

synonym_data = indent sentence+ EOL?
synonym_definition = "~[" element_name "]" props? EOL
  synonym_data*

comment = "#" indent text? EOL?

""", 'root', skipws=False)

def parse(input_string):
  """Parses the given DSL string and returns parsed results.

  Args:
    input_string (str): DSL string

  Returns:
    dict: Parsed content

  """
  tree = parser.parse(input_string)
  visitor = ChatlVisitor()

  return visit_parse_tree(tree, visitor)

def extract_variant(definition):
  """Extract variant if any from an entity definition.

  Args:
    definition (str): Full definition

  Returns:
    tuple: Value and variant if any

  Examples:
    >>> extract_variant('hour#fixed')
    ('hour', 'fixed')
    >>> extract_variant('room')
    ('room', None)

  """
  value, *variant = definition.split('#')

  return (value, variant[0] if variant else None)

class ChatlVisitor (PTNodeVisitor):
  """Custom visitor to traverse the tree given by Arpeggio and output data that are
  usable by adapters.
  """

  def __init__(self):
    super().__init__(defaults=False)

  def visit_sentence(self, node, children):
    return { 'type': 'text', 'value': node.value }

  def visit_text(self, node, children):
    return node.value

  def visit_synonym_alias(self, node, children):
    return { 'type': 'synonym', 'value': children.element_name[0] }

  def visit_optional(self, node, children):
    return True

  def visit_intent_synonym(self, node, children):
    return {
      'type': 'synonym',
      'value': children.element_name[0],
      'optional': any(children.optional),
    }

  def visit_entity_alias(self, node, children):
    value, variant = extract_variant(children.element_name[0])

    return {
      'type': 'entity',
      'value': value,
      'variant': variant,
    }

  def visit_element_name(self, node, children):
    return node.value

  def visit_prop_key(self, node, children):
    return node.value

  def visit_prop_value(self, node, children):
    return children.backticked_value[0] if children.backticked_value else node.value

  def visit_backticked_value(self, node, children):
    return node.value

  def visit_prop(self, node, children):
    return (children.prop_key[0], children.prop_value[0])

  def visit_props(self, node, children):
    return dict(children.prop)

  def visit_intent_data(self, node, children):
    return children

  def visit_entity_data(self, node, children):
    return children

  def visit_synonym_data(self, node, children):
    return children

  def visit_intent_definition(self, node, children):
    return {
      children.element_name[0]: {
        'props': children.props[0] if children.props else {},
        'data': children.intent_data,
      },
    }

  def visit_entity_definition(self, node, children):
    return {
      children.element_name[0]: {
        'variants': {},
        'props': children.props[0] if children.props else {},
        'data': [c[0] for c in children.entity_data],
      },
    }

  def visit_synonym_definition(self, node, children):
    return {
      children.element_name[0]: {
        'props': children.props[0] if children.props else {},
        'data': [c[0] for c in children.synonym_data],
      },
    }

  def visit_comment(self, node, children):
    return { 
      'type': 'comment',
      'value': children.text[0] if children.text else '',
    }

  def visit_root(self, node, children):
    intents = {}
    entities = {}
    synonyms = {}
    variants = []

    for intent in children.intent_definition:
      intents.update(intent)

    for synonym in children.synonym_definition:
      synonyms.update(synonym)

    for entity in children.entity_definition:
      entities.update(entity)

      # Check if the entity stuff has some variants so it needs to be post-processed
      for name, data in entity.items():
        n, v = extract_variant(name)

        if v:
          variants.append((name, n, v, data))

    # Post process variants now
    for fullname, name, variant, data in variants:
      entities[name]['variants'][variant] = data['data']
      entities[name]['props'].update(data['props'])
      del entities[fullname]

    return {
      'intents': intents,
      'entities': entities,
      'synonyms': synonyms,
      'comments': children.comment,
    }
