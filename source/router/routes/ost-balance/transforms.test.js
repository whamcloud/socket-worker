import { describe, it, expect } from '../../../jasmine.js';

import {
  transformMetrics,
  combineWithTargets,
  toNvd3,
  sort
} from './transforms.js';

describe('ost balance transforms', () => {
  it('should transform metrics', () => {
    expect(
      transformMetrics({
        '18': [
          {
            data: {
              kbytesfree: 1980009,
              kbytestotal: 2015824
            },
            ts: '2013-11-18T22:45:30+00:00',
            id: '18'
          }
        ],
        '19': [
          {
            data: {
              kbytesfree: 2015824,
              kbytestotal: 2015824
            },
            ts: '2013-11-18T22:45:30+00:00',
            id: '19'
          }
        ],
        '20': []
      })
    ).toEqual([
      {
        detail: {
          bytesFree: '1.888 GB',
          bytesTotal: '1.922 GB',
          bytesUsed: '34.98 MB',
          percentFree: 98,
          percentUsed: 2
        },
        free: 0.9822330719348514,
        kbytesfree: 1980009,
        kbytestotal: 2015824,
        used: 0.01776692806514857,
        x: '18'
      },
      {
        detail: {
          bytesFree: '1.922 GB',
          bytesTotal: '1.922 GB',
          bytesUsed: '0.000 B',
          percentFree: 100,
          percentUsed: 0
        },
        free: 1,
        kbytesfree: 2015824,
        kbytestotal: 2015824,
        used: 0,
        x: '19'
      }
    ]);
  });

  it('should combine metrics with targets', () => {
    expect(
      combineWithTargets([
        [
          {
            detail: {
              bytesFree: '1.888 GB',
              bytesTotal: '1.922 GB',
              bytesUsed: '34.98 MB',
              percentFree: 98,
              percentUsed: 2
            },
            free: 0.9822330719348514,
            kbytesfree: 1980009,
            kbytestotal: 2015824,
            used: 0.01776692806514857,
            x: '18'
          },
          {
            detail: {
              bytesFree: '1.922 GB',
              bytesTotal: '1.922 GB',
              bytesUsed: '0.000 B',
              percentFree: 100,
              percentUsed: 0
            },
            free: 1,
            kbytesfree: 2015824,
            kbytestotal: 2015824,
            used: 0,
            x: '19'
          }
        ],
        [{ id: '19', name: 'foo' }, { id: '17', name: 'bar' }]
      ])
    ).toEqual([
      {
        detail: {
          bytesFree: '1.888 GB',
          bytesTotal: '1.922 GB',
          bytesUsed: '34.98 MB',
          percentFree: 98,
          percentUsed: 2
        },
        free: 0.9822330719348514,
        kbytesfree: 1980009,
        kbytestotal: 2015824,
        used: 0.01776692806514857,
        x: '18'
      },
      {
        detail: {
          bytesFree: '1.922 GB',
          bytesTotal: '1.922 GB',
          bytesUsed: '0.000 B',
          percentFree: 100,
          percentUsed: 0
        },
        free: 1,
        kbytesfree: 2015824,
        kbytestotal: 2015824,
        used: 0,
        x: 'foo'
      }
    ]);
  });

  it('should convert output to a nvd3 compatible format', () => {
    expect(
      toNvd3([
        {
          detail: {
            bytesFree: '1.888 GB',
            bytesTotal: '1.922 GB',
            bytesUsed: '34.98 MB',
            percentFree: 98,
            percentUsed: 2
          },
          free: 0.9822330719348514,
          kbytesfree: 1980009,
          kbytestotal: 2015824,
          used: 0.01776692806514857,
          x: '18'
        },
        {
          detail: {
            bytesFree: '1.922 GB',
            bytesTotal: '1.922 GB',
            bytesUsed: '0.000 B',
            percentFree: 100,
            percentUsed: 0
          },
          free: 1,
          kbytesfree: 2015824,
          kbytestotal: 2015824,
          used: 0,
          x: 'foo'
        }
      ])
    ).toEqual([
      {
        key: 'Used bytes',
        values: [
          {
            detail: {
              bytesFree: '1.888 GB',
              bytesTotal: '1.922 GB',
              bytesUsed: '34.98 MB',
              percentFree: 98,
              percentUsed: 2
            },
            x: '18',
            y: 0.01776692806514857
          },
          {
            detail: {
              bytesFree: '1.922 GB',
              bytesTotal: '1.922 GB',
              bytesUsed: '0.000 B',
              percentFree: 100,
              percentUsed: 0
            },
            x: 'foo',
            y: 0
          }
        ]
      },
      {
        key: 'Free bytes',
        values: [
          {
            detail: {
              bytesFree: '1.888 GB',
              bytesTotal: '1.922 GB',
              bytesUsed: '34.98 MB',
              percentFree: 98,
              percentUsed: 2
            },
            x: '18',
            y: 0.9822330719348514
          },
          {
            detail: {
              bytesFree: '1.922 GB',
              bytesTotal: '1.922 GB',
              bytesUsed: '0.000 B',
              percentFree: 100,
              percentUsed: 0
            },
            x: 'foo',
            y: 1
          }
        ]
      }
    ]);
  });

  it('should sort metrics', () => {
    expect(
      sort([{ values: [{ x: 'zebra' }, { x: '18' }, { x: 'apple' }] }])
    ).toEqual([{ values: [{ x: '18' }, { x: 'apple' }, { x: 'zebra' }] }]);
  });
});
