from arpeggio import PTNodeVisitor
from arpeggio.cleanpeg import ParserPEG, visit_parse_tree

parser = ParserPEG("""
root = (intent_definition / entity_definition / synonym_definition / comment / EOL)+

EOL = r'\\n|\\r\\n'
indent = r'[ ]*'
sentence = r'[^@^~^%^#^\\n^\\r\\n]+'

element_name = r'[^]]+'

entity_alias = "@[" element_name "]"
synonym_alias = "~[" element_name "]"

prop_key = r'[^=^\n^\r\n]*'
prop_value = r'[^,^)^\n^\r\n]*'
prop = prop_key "=" prop_value indent r'[,]?' indent
props = "(" prop+ ")"

entity_data = indent (synonym_alias / sentence) EOL?
entity_definition = "@[" element_name "]" props? EOL
  entity_data*

intent_data = indent (entity_alias / synonym_alias / sentence)+ EOL?
intent_definition = "%[" element_name "]" props? EOL
  intent_data*

synonym_data = indent sentence+ EOL?
synonym_definition = "~[" element_name "]" props? EOL
  synonym_data*

comment = "#" sentence? EOL?

""", 'root', skipws=False)

def parse(input_string, prefix=''):
  """Parses the given DSL string and returns parsed results.

  Args:
    input_string (str): DSL string
    prefix (str): Optional prefix to add to every element name, useful to namespace things

  Returns:
    dict: Parsed content

  """

  tree = parser.parse(input_string)
  visitor = ChatlVisitor(prefix)

  visit_parse_tree(tree, visitor)

  return visitor.parsed

class ChatlVisitor (PTNodeVisitor):
  """Custom visitor to traverse the tree given by Arpeggio and output data that are
  usable for adapters.

  It could be better but it works already well.

  """

  def __init__(self, prefix=''):
    super(ChatlVisitor, self).__init__ ()

    self._cur_element = None
    self._cur_name = None
    self._cur_training_data = []
    self._cur_raw_data = []
    self._cur_prop_key = None
    self._cur_prop_value = None
    self._cur_props = {}

    self.prefix = prefix
    self.parsed = {
      'intents': {},
      'entities': {},
      'synonyms': {},
    }

  def _append_and_reset(self, key, flatten_data=False):
    splitted = self._cur_element.split('#')
    data = [d[0] for d in self._cur_training_data] if flatten_data else self._cur_training_data
    name = self._cur_element
    variant = None

    if len(splitted) > 1:
      name, variant = splitted

    if name not in self.parsed[key]:
      initial_data = { 'props': {}, 'data': [] }

      # Add the variants key for entities
      if key == 'entities':
        initial_data['variants'] = {}
      
      self.parsed[key][name] = initial_data

    self.parsed[key][name]['props'].update(self._cur_props)
    
    if variant:
      self.parsed[key][name]['variants'][variant] = data
    else:
      self.parsed[key][name]['data'].extend(data)

    self._reset()

  def _reset(self):
    self._cur_training_data = []
    self._cur_raw_data = []
    self._cur_element = None
    self._cur_props = {}

  def _append_cur_data(self):
    self._cur_training_data.append (self._cur_raw_data)
    self._cur_raw_data = []

  def visit_prop_key(self, node, children):
    self._cur_prop_key = node.value

  def visit_prop_value(self, node, children):
    self._cur_prop_value = node.value
    self._cur_props[self._cur_prop_key] = self._cur_prop_value

  def visit_element_name(self, node, children):
    if self._cur_element:
      self._cur_name = self.prefix + node.value
    else:
      self._reset()
      self._cur_element = self.prefix + node.value

  def visit_sentence(self, node, children):
    self._cur_raw_data.append({
      'type': 'text',
      'value': node.value,
    })

  def visit_intent_definition(self, node, children):
    self._append_and_reset('intents')

  def visit_entity_definition(self, node, children):
    self._append_and_reset('entities', True)

  def visit_synonym_definition(self, node, children):
    self._append_and_reset('synonyms', True)

  def visit_entity_alias(self, node, children):
    splitted = self._cur_name.split('#')
    value = self._cur_name
    variant = None

    if len (splitted) > 1:
      value, variant = splitted

    self._cur_raw_data.append({
      'type': 'entity',
      'value': value,
      'variant': variant,
    })

  def visit_synonym_alias(self, node, children):
    self._cur_raw_data.append({
      'type': 'synonym',
      'value': self._cur_name,
    })

  def visit_intent_data(self, node, children):
    self._append_cur_data()

  def visit_entity_data(self, node, children):
    self._append_cur_data()

  def visit_synonym_data(self, node, children):
    self._append_cur_data()
