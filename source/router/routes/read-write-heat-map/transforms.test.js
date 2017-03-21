import highland from 'highland';
import {objToPoints} from './transforms.js';

describe('transforms', function () {
  let spy;

  describe('obj to points', () => {
    let result;
    beforeEach(() => {
      spy = jasmine.createSpy('spy');
    });

    it('should convert obj to a points stream', function () {
      result = objToPoints(
        {
          1: [{
            data: { foo: 'bar' }
          }]
        }
      );

      expect(result).toEqual([{
        data: { foo: 'bar' },
        id: '1',
        name: '1'
      }]);
    });

    it('should convert objs to a points stream', function () {
      result = objToPoints(
        {
          1: [
            { data: { foo: 'bar' } },
            { data: { bar: 'baz' } }
          ],
          2: [
            { data: { foo: 'bap' } }
          ],
          3: []
        }
      );

      expect(result).toEqual([
        { data: { foo: 'bar' }, id: '1', name: '1' },
        { data: { bar: 'baz' }, id: '1', name: '1' },
        { data: { foo: 'bap' }, id: '2', name: '2' }
      ]);
    });
  });
});
