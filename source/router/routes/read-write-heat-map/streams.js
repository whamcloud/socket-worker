// @flow

//
// Copyright (c) 2017 DDN. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.

import { default as highland, type HighlandStreamT } from 'highland';
import {
  objToPoints,
  appendWithBuff,
  compareByTsAndId,
  sortOsts,
  combineWithTargets
} from './transforms.js';
import {
  calculateRangeFromSizeAndUnit,
  getServerMoment,
  getDurationParams
} from '../../../date.js';

import type {
  HeatMapEntries,
  HeatMapRequest,
  Target,
  MoreQs
} from './route.js';

import type { Unit } from '../../../date.js';

const getTargetStream = (req: HeatMapRequest): HighlandStreamT<Target[]> =>
  req
    .getOne$({
      path: '/target',
      options: {
        method: 'get',
        qs: { limit: 0 },
        jsonMask: 'objects(id,name)'
      }
    })
    .map(x => x.objects);

type ReturnValues = Object => HeatMapEntries[];
const values = ((Object.values: any): ReturnValues);

export const getDurationStream = (
  req: HeatMapRequest,
  moreQs: MoreQs,
  timeOffset: number,
  { size, unit }: { size: number, unit: Unit }
): HighlandStreamT<HeatMapEntries[]> => {
  let buffer = [];
  const metric$ = highland((push, next) => {
    const [begin, end] = calculateRangeFromSizeAndUnit(
      size,
      unit,
      getServerMoment(timeOffset, new Date())
    );

    const params = getDurationParams(begin, end, buffer);
    const targetStream: HighlandStreamT<Target[]> = getTargetStream(req);

    req
      .getOne$({
        path: '/target/metric',
        options: {
          method: 'get',
          qs: {
            kind: 'OST',
            ...moreQs,
            ...params
          }
        }
      })
      .map(objToPoints)
      .map(appendWithBuff(buffer, begin))
      .tap(xs => (buffer = xs))
      .zip(targetStream)
      .map(combineWithTargets)
      .flatten()
      .uniqBy(compareByTsAndId)
      .group('id')
      .map(values)
      .map(sortOsts)
      .each(x => {
        push(null, x);
        next();
      });
  }).ratelimit(1, 10000);
  req.connections[req.id].push(metric$);
  return metric$;
};

export const getRangeStream = (
  req: HeatMapRequest,
  moreQs: MoreQs,
  timeOffset: number,
  { startDate, endDate }: { startDate: string, endDate: string }
): HighlandStreamT<HeatMapEntries[]> => {
  const targetStream = getTargetStream(req);
  const begin = getServerMoment(timeOffset, new Date(startDate)).toISOString();
  const end = getServerMoment(timeOffset, new Date(endDate)).toISOString();

  return req
    .getOne$({
      path: '/target/metric',
      options: {
        method: 'get',
        qs: {
          kind: 'OST',
          ...moreQs,
          begin,
          end
        }
      }
    })
    .map(objToPoints)
    .zip(targetStream)
    .map(combineWithTargets)
    .flatten()
    .uniqBy(compareByTsAndId)
    .group('id')
    .map(values)
    .map(sortOsts);
};
