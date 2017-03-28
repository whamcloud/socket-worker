// @flow

import highland from 'highland';
import * as transforms from './transforms.js';

import { jasmine, describe, it, beforeEach, expect } from '../../../jasmine.js';

import type { HeatMapEntry } from './heat-map-types';

describe('transforms', function() {
  let result, spy;

  beforeEach(() => {
    spy = jasmine.createSpy('spy');
  });

  describe('obj to points', () => {
    it('should convert obj to a points stream', function() {
      result = transforms.objToPoints({
        [1]: [
          {
            data: { foo: 'bar' }
          }
        ]
      });

      expect(result).toEqual([
        {
          data: { foo: 'bar' },
          id: '1',
          name: '1'
        }
      ]);
    });

    it('should convert objs to a points stream', function() {
      result = transforms.objToPoints({
        [1]: [{ data: { foo: 'bar' } }, { data: { bar: 'baz' } }],
        [2]: [{ data: { foo: 'bap' } }],
        [3]: []
      });

      expect(result).toEqual([
        { data: { foo: 'bar' }, id: '1', name: '1' },
        { data: { bar: 'baz' }, id: '1', name: '1' },
        { data: { foo: 'bap' }, id: '2', name: '2' }
      ]);
    });
  });

  describe('concatWithBuff', () => {
    let buffer = [];
    beforeEach(() => {
      buffer = [
        {
          data: { foo: 'bar' },
          id: '1',
          name: '1',
          ts: '2017-01-01T:00:00:00+00:00'
        }
      ];
    });

    it('should concat new data with the existing buffer', () => {
      const result = transforms.concatWithBuff(buffer)([
        {
          data: { bar: 'baz' },
          id: '1',
          name: '1',
          ts: '2017-01-01T:00:00:00+00:00'
        }
      ]);
      expect(result).toEqual([
        {
          data: { foo: 'bar' },
          id: '1',
          name: '1',
          ts: '2017-01-01T:00:00:00+00:00'
        },
        {
          data: { bar: 'baz' },
          id: '1',
          name: '1',
          ts: '2017-01-01T:00:00:00+00:00'
        }
      ]);
    });
  });

  describe('filterWithLeadingEdge', () => {
    result;
    beforeEach(() => {
      result = transforms.filterWithLeadingEdge('2017-01-01T07:00:00+00:00')([
        {
          data: { foo: 'bar' },
          id: '1',
          name: '1',
          ts: '2017-01-01T05:00:00+00:00'
        },
        {
          data: { bar: 'baz' },
          id: '1',
          name: '1',
          ts: '2017-01-01T08:00:00+00:00'
        }
      ]);
    });

    it('should filter by leading edge', () => {
      expect(result).toEqual([
        {
          data: { bar: 'baz' },
          id: '1',
          name: '1',
          ts: '2017-01-01T08:00:00+00:00'
        }
      ]);
    });
  });

  describe('sorting by timestamp', () => {
    it('should sort entries by the timestamp', () => {
      const xs = [
        {
          data: { bar: 'baz' },
          name: '1',
          id: '1',
          ts: '2017-01-01T07:00:00+00:00'
        },
        {
          data: { bar: 'baz' },
          name: '1',
          id: '1',
          ts: '2017-01-01T05:00:00+00:00'
        },
        {
          data: { bar: 'baz' },
          name: '1',
          id: '1',
          ts: '2017-01-01T06:00:00+00:00'
        }
      ];
      result = transforms.sortWithTs(xs);

      expect(result).toEqual([
        {
          data: { bar: 'baz' },
          name: '1',
          id: '1',
          ts: '2017-01-01T05:00:00+00:00'
        },
        {
          data: { bar: 'baz' },
          name: '1',
          id: '1',
          ts: '2017-01-01T06:00:00+00:00'
        },
        {
          data: { bar: 'baz' },
          name: '1',
          id: '1',
          ts: '2017-01-01T07:00:00+00:00'
        }
      ]);
    });
  });

  describe('comparing by timestamp and id', () => {
    it('should produce unique items', () => {
      const item1: HeatMapEntry = {
        id: '1',
        name: '1',
        ts: '2017-01-01T05:00:00+00:00',
        data: { bar: 'baz' }
      };
      const item2: HeatMapEntry = {
        id: '2',
        name: '2',
        ts: '2017-01-01T06:00:00+00:00',
        data: { bar: 'baz' }
      };
      const item3: HeatMapEntry = {
        id: '1',
        name: '1',
        ts: '2017-01-01T05:00:00+00:00',
        data: { bar: 'baz' }
      };
      const item4: HeatMapEntry = {
        id: '2',
        name: '2',
        ts: '2017-01-01T07:00:00+00:00',
        data: { bar: 'baz' }
      };

      highland([item1, item2, item3, item4])
        .uniqBy(transforms.compareByTsAndId)
        .group('id')
        .each(spy);

      expect(spy).toHaveBeenCalledWith({
        '1': [
          {
            id: '1',
            name: '1',
            ts: '2017-01-01T05:00:00+00:00',
            data: { bar: 'baz' }
          }
        ],
        '2': [
          {
            id: '2',
            name: '2',
            ts: '2017-01-01T06:00:00+00:00',
            data: { bar: 'baz' }
          },
          {
            id: '2',
            name: '2',
            ts: '2017-01-01T07:00:00+00:00',
            data: { bar: 'baz' }
          }
        ]
      });
    });
  });

  describe('sorting OST items', () => {
    it('should produce a list of OST items an ascending order', () => {
      result = transforms.sortOsts([
        [
          {
            data: { foo: 'bar' },
            id: '2',
            name: 'ost2',
            ts: '2017-01-01T05:00:00+00:00'
          },
          {
            data: { bar: 'baz' },
            id: '2',
            name: 'ost2',
            ts: '2017-01-01T08:00:00+00:00'
          }
        ],
        [
          {
            data: { foo: 'bar' },
            id: '1',
            name: 'ost1',
            ts: '2017-01-01T05:00:00+00:00'
          },
          {
            data: { bar: 'baz' },
            id: '1',
            name: 'ost1',
            ts: '2017-01-01T08:00:00+00:00'
          }
        ]
      ]);

      expect(result).toEqual([
        [
          {
            data: { foo: 'bar' },
            id: '1',
            name: 'ost1',
            ts: '2017-01-01T05:00:00+00:00'
          },
          {
            data: { bar: 'baz' },
            id: '1',
            name: 'ost1',
            ts: '2017-01-01T08:00:00+00:00'
          }
        ],
        [
          {
            data: { foo: 'bar' },
            id: '2',
            name: 'ost2',
            ts: '2017-01-01T05:00:00+00:00'
          },
          {
            data: { bar: 'baz' },
            id: '2',
            name: 'ost2',
            ts: '2017-01-01T08:00:00+00:00'
          }
        ]
      ]);
    });
  });

  describe('appending with buff', () => {
    it('should concat, filter, and sort by timestamp', () => {
      const buffer = [
        {
          data: { foo: 'bar' },
          id: '2',
          name: 'ost2',
          ts: '2017-01-01T05:00:00+00:00'
        },
        {
          data: { bar: 'baz' },
          id: '2',
          name: 'ost2',
          ts: '2017-01-01T08:00:00+00:00'
        }
      ];
      const leadingEdge = '2017-01-01T04:00:00+00:00';
      result = transforms.appendWithBuff(buffer, leadingEdge)([
        {
          data: { baz: 'bap' },
          id: '2',
          name: 'ost2',
          ts: '2017-01-01T06:00:00+00:00'
        },
        {
          data: { baz: 'bap' },
          id: '2',
          name: 'ost2',
          ts: '2017-01-01T02:00:00+00:00'
        }
      ]);

      expect(result).toEqual([
        {
          data: { foo: 'bar' },
          id: '2',
          name: 'ost2',
          ts: '2017-01-01T05:00:00+00:00'
        },
        {
          data: { baz: 'bap' },
          id: '2',
          name: 'ost2',
          ts: '2017-01-01T06:00:00+00:00'
        },
        {
          data: { bar: 'baz' },
          id: '2',
          name: 'ost2',
          ts: '2017-01-01T08:00:00+00:00'
        }
      ]);
    });
  });

  describe('combine with targets', () => {
    it('should replace names with the matching target name based on id', () => {
      result = transforms.combineWithTargets([
        [
          {
            data: { foo: 'bar' },
            id: '1',
            name: '1',
            ts: '2017-01-01T05:00:00+00:00'
          },
          {
            data: { baz: 'bap' },
            id: '2',
            name: '2',
            ts: '2017-01-01T06:00:00+00:00'
          }
        ],
        [
          {
            id: '1',
            name: 'ost1'
          },
          {
            id: '2',
            name: 'ost2'
          }
        ]
      ]);

      expect(result).toEqual([
        {
          data: { foo: 'bar' },
          id: '1',
          name: 'ost1',
          ts: '2017-01-01T05:00:00+00:00'
        },
        {
          data: { baz: 'bap' },
          id: '2',
          name: 'ost2',
          ts: '2017-01-01T06:00:00+00:00'
        }
      ]);
    });
  });
});
