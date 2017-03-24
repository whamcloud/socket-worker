import highland from 'highland';

import {
  jest,
  jasmine,
  describe,
  it,
  beforeEach,
  afterEach,
  expect
} from '../../../jasmine.js';

import * as date from '../../../date.js';
import * as streams from './streams.js';
import * as transforms from './transforms.js';

describe('heatmap streams', () => {
  let req, metric$, getOne$, target$, one$, metricSpy;
  beforeEach(() => {
    metricSpy = jasmine.createSpy('spy');
    jest
      .spyOn(date, 'getServerMoment')
      .mockImplementation(() => new Date('2017-01-21T12:10:00+00:00'));
    jest.spyOn(date, 'calculateRangeFromSizeAndUnit');
    jest.spyOn(date, 'getDurationParams');

    jest.spyOn(transforms, 'objToPoints');
    jest.spyOn(transforms, 'appendWithBuff');
    jest.spyOn(transforms, 'compareByTsAndId');
    jest.spyOn(transforms, 'sortOsts');
    jest.spyOn(transforms, 'combineWithTargets');
    jest.spyOn(transforms, 'filterDataByType');
  });

  describe('duration stream', () => {
    beforeEach(() => {
      target$ = highland([
        {
          objects: [{ id: '1', name: 'ost1' }, { id: '2', name: 'ost2' }]
        }
      ]);

      one$ = highland([
        {
          1: [
            {
              data: {
                stats_read_bytes: 7613151815.7
              },
              ts: '2017-01-21T12:01:00+00:00'
            },
            {
              data: {
                stats_read_bytes: 7613151815.7
              },
              ts: '2017-01-21T12:03:00+00:00'
            }
          ]
        }
      ]);

      getOne$ = jasmine.createSpy('getOne$').and.callFake(x => {
        switch (x.path) {
          case '/target':
            return target$;
          case '/target/metric':
            return one$;
        }
      });

      req = {
        payload: {
          options: {
            qs: { foo: 'bar' },
            durationParams: {
              size: 10,
              unit: 'minutes'
            },
            timeOffset: -275,
            type: 'stats_read_bytes'
          }
        },
        streams: {
          1: []
        },
        id: 1,
        getOne$
      };

      metric$ = streams.getDurationStream(
        req,
        undefined,
        -275,
        { size: 10, unit: 'minutes' },
        'stats_read_bytes'
      );

      metric$.each(metricSpy);
    });

    afterEach(() => {
      metric$.destroy();
      one$.destroy();
      target$.destroy();
    });

    it('should invoke date.calculateRangeFromSizeAndUnit', () => {
      expect(date.calculateRangeFromSizeAndUnit).toHaveBeenCalledWith(
        10,
        'minutes',
        new Date('2017-01-21T12:10:00.000Z')
      );
    });

    it('should call date.getServerMoment with the timeOffset and a date', () => {
      expect(date.getServerMoment).toHaveBeenCalledWith(
        -275,
        jasmine.any(Date)
      );
    });

    it('should call date.getDurationParams', () => {
      expect(
        date.getDurationParams
      ).toHaveBeenCalledWith(
        '2017-01-21T12:00:00.000Z',
        '2017-01-21T12:10:10.000Z',
        []
      );
    });

    it('should call getOne$', () => {
      expect(getOne$).toHaveBeenCalledWith({
        path: '/target/metric',
        options: {
          method: 'get',
          qs: {
            begin: '2017-01-21T12:00:00.000Z',
            end: '2017-01-21T12:10:10.000Z',
            kind: 'OST',
            update: false
          }
        }
      });
    });

    it('should call objToPoints', () => {
      expect(transforms.objToPoints).toHaveBeenCalledWith({
        '1': [
          {
            data: { stats_read_bytes: 7613151815.7 },
            ts: '2017-01-21T12:01:00+00:00'
          },
          {
            data: { stats_read_bytes: 7613151815.7 },
            ts: '2017-01-21T12:03:00+00:00'
          }
        ]
      });
    });

    it('should call appendBuffer', () => {
      expect(transforms.appendWithBuff).toHaveBeenCalledWith(
        [],
        '2017-01-21T12:00:00.000Z'
      );
    });

    it('should combine with the targets', () => {
      expect(transforms.combineWithTargets).toHaveBeenCalledWith([
        [
          {
            data: { stats_read_bytes: 7613151815.7 },
            ts: '2017-01-21T12:01:00+00:00',
            id: '1',
            name: '1'
          },
          {
            data: { stats_read_bytes: 7613151815.7 },
            ts: '2017-01-21T12:03:00+00:00',
            id: '1',
            name: '1'
          }
        ],
        [{ id: '1', name: 'ost1' }, { id: '2', name: 'ost2' }]
      ]);
    });

    it('should call filterDataByType', () => {
      expect(transforms.filterDataByType).toHaveBeenCalledWith(
        'stats_read_bytes'
      );
    });

    it('should call compareByTsAndId', () => {
      expect(transforms.compareByTsAndId).toHaveBeenCalled();
    });

    it('should call sortOsts', () => {
      expect(transforms.sortOsts).toHaveBeenCalledWith([
        [
          {
            data: { stats_read_bytes: 7613151815.7 },
            id: '1',
            name: 'ost1',
            ts: '2017-01-21T12:01:00+00:00'
          },
          {
            data: { stats_read_bytes: 7613151815.7 },
            id: '1',
            name: 'ost1',
            ts: '2017-01-21T12:03:00+00:00'
          }
        ]
      ]);
    });

    it('should pass the value through the metric stream', () => {
      expect(metricSpy).toHaveBeenCalledWith([
        [
          {
            data: { stats_read_bytes: 7613151815.7 },
            id: '1',
            name: 'ost1',
            ts: '2017-01-21T12:01:00+00:00'
          },
          {
            data: { stats_read_bytes: 7613151815.7 },
            id: '1',
            name: 'ost1',
            ts: '2017-01-21T12:03:00+00:00'
          }
        ]
      ]);
    });

    it('should push the metric stream into req.streams', () => {
      expect(req.streams[req.id][0]).toBe(metric$);
    });
  });

  describe('range stream', () => {
    let startDate, endDate;
    beforeEach(() => {
      startDate = '2017-01-21T12:00:00+00:00';
      endDate = '2017-01-21T12:10:00+00:00';
      jest
        .spyOn(date, 'getServerMoment')
        .mockImplementation((timeOffset, date) => date);

      target$ = highland([
        {
          objects: [{ id: '1', name: 'ost1' }, { id: '2', name: 'ost2' }]
        }
      ]);

      one$ = highland([
        {
          1: [
            {
              data: {
                stats_read_bytes: 7613151815.7
              },
              ts: '2017-01-21T12:01:00+00:00'
            },
            {
              data: {
                stats_read_bytes: 7613151815.7
              },
              ts: '2017-01-21T12:03:00+00:00'
            }
          ]
        }
      ]);

      getOne$ = jasmine.createSpy('getOne$').and.callFake(x => {
        switch (x.path) {
          case '/target':
            return target$;
          case '/target/metric':
            return one$;
        }
      });

      req = {
        payload: {
          options: {
            qs: { foo: 'bar' },
            durationParams: {
              startDate,
              endDate
            },
            timeOffset: -275,
            type: 'stats_read_bytes'
          }
        },
        streams: {
          1: []
        },
        id: 1,
        getOne$
      };

      metric$ = streams.getRangeStream(
        req,
        undefined,
        -275,
        {
          startDate,
          endDate
        },
        'stats_read_bytes'
      );

      metric$.each(metricSpy);
    });

    afterEach(() => {
      metric$.destroy();
      one$.destroy();
      target$.destroy();
    });

    it('should call getServerMoment for the begin date', () => {
      expect(date.getServerMoment).toHaveBeenCalledWith(
        -275,
        new Date(startDate)
      );
    });

    it('should call getServerMoment for the end date', () => {
      expect(date.getServerMoment).toHaveBeenCalledWith(
        -275,
        new Date(endDate)
      );
    });

    it('should call req.getOne$', () => {
      expect(req.getOne$).toHaveBeenCalledWith({
        path: '/target/metric',
        options: {
          method: 'get',
          qs: {
            kind: 'OST',
            begin: new Date(startDate).toISOString(),
            end: new Date(endDate).toISOString()
          }
        }
      });
    });

    it('should call objToPoints', () => {
      expect(transforms.objToPoints).toHaveBeenCalledWith({
        '1': [
          {
            data: {
              stats_read_bytes: 7613151815.7
            },
            ts: '2017-01-21T12:01:00+00:00'
          },
          {
            data: {
              stats_read_bytes: 7613151815.7
            },
            ts: '2017-01-21T12:03:00+00:00'
          }
        ]
      });
    });

    it('should call combineWithTargets', () => {
      expect(transforms.combineWithTargets).toHaveBeenCalledWith([
        [
          {
            data: {
              stats_read_bytes: 7613151815.7
            },
            ts: '2017-01-21T12:01:00+00:00',
            id: '1',
            name: '1'
          },
          {
            data: {
              stats_read_bytes: 7613151815.7
            },
            ts: '2017-01-21T12:03:00+00:00',
            id: '1',
            name: '1'
          }
        ],
        [{ id: '1', name: 'ost1' }, { id: '2', name: 'ost2' }]
      ]);
    });

    it('should call filterDataByType', () => {
      expect(transforms.filterDataByType).toHaveBeenCalledWith(
        'stats_read_bytes'
      );
    });

    it('should call compareByTsAndId', () => {
      expect(transforms.compareByTsAndId).toHaveBeenCalled();
    });

    it('should call sortOsts', () => {
      expect(transforms.sortOsts).toHaveBeenCalledWith([
        [
          {
            data: {
              stats_read_bytes: 7613151815.7
            },
            ts: '2017-01-21T12:01:00+00:00',
            id: '1',
            name: 'ost1'
          },
          {
            data: {
              stats_read_bytes: 7613151815.7
            },
            ts: '2017-01-21T12:03:00+00:00',
            id: '1',
            name: 'ost1'
          }
        ]
      ]);
    });

    it('should pass the data to the stream', () => {
      expect(metricSpy).toHaveBeenCalledWith([
        [
          {
            data: {
              stats_read_bytes: 7613151815.7
            },
            ts: '2017-01-21T12:01:00+00:00',
            id: '1',
            name: 'ost1'
          },
          {
            data: {
              stats_read_bytes: 7613151815.7
            },
            ts: '2017-01-21T12:03:00+00:00',
            id: '1',
            name: 'ost1'
          }
        ]
      ]);
    });
  });
});
