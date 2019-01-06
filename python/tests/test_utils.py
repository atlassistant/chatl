from sure import expect
from pychatl.utils import deep_update

class TestUtils:

  def test_it_should_be_able_to_deep_update_a_dict(self):
    a = {
      'language': 'en',
      'entities': {
        'room': {
          'data': [
            {
              'value': 'kitchen',
            },
            {
              'value': 'bedroom',
            },
          ],
          'automatically_extensible': True,
        }
      }
    }

    b = {
      'language': 'fr',
      'entities': {
        'room': {
          'data': [
            {
              'value': 'living room',
            },
          ],
          'automatically_extensible': False,
        },
        'city': {
          'data': [
            {
              'value': 'paris',
            },
          ],
          'automatically_extensible': True,
        },
      }
    }

    result = deep_update(a, b)

    expect(result['language']).to.equal('fr')
    expect(result['entities']).to.have.key('room')
    expect(result['entities']['room']['automatically_extensible']).to.be.false

    data = result['entities']['room']['data']
    
    expect(data).to.have.length_of(3)

    room_names = [d['value'] for d in data]

    expect(room_names).to.contain('kitchen')
    expect(room_names).to.contain('bedroom')
    expect(room_names).to.contain('living room')

    expect(result['entities']).to.have.key('city')
    expect(result['entities']['city']['data']).to.have.length_of(1)
    expect(result['entities']['city']['automatically_extensible']).to.be.true