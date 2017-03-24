// @flow

//
// INTEL CONFIDENTIAL
//
// Copyright 2013-2017 Intel Corporation All Rights Reserved.
//
// The source code contained or described herein and all documents related
// to the source code ("Material") are owned by Intel Corporation or its
// suppliers or licensors. Title to the Material remains with Intel Corporation
// or its suppliers and licensors. The Material contains trade secrets and
// proprietary and confidential information of Intel or its suppliers and
// licensors. The Material is protected by worldwide copyright and trade secret
// laws and treaty provisions. No part of the Material may be used, copied,
// reproduced, modified, published, uploaded, posted, transmitted, distributed,
// or disclosed in any way without Intel's prior express written permission.
//
// No license under any patent, copyright, trade secret or other intellectual
// property right is granted to or conferred upon you by disclosure or delivery
// of the Materials, either expressly, by implication, inducement, estoppel or
// otherwise. Any license under such intellectual property rights must be
// express and approved by Intel in writing.

import { default as highland, type HighlandStreamT } from 'highland';
import {
  objToPoints,
  appendWithBuff,
  compareByTsAndId,
  sortOsts,
  combineWithTargets,
  filterDataByType
} from './transforms.js';
import {
  calculateRangeFromSizeAndUnit,
  getServerMoment,
  getDurationParams
} from '../../../date.js';

import type { Types, HeatMapEntries, Target } from './heat-map-types.js';

import type { Req } from '../../middleware/middleware-types';

import type { Unit } from '../../../date.js';

const getTargetStream = (
  req: Req
): HighlandStreamT<[HeatMapEntries, Target[]]> =>
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

export const getDurationStream = (
  req: Req,
  moreQs: Object,
  timeOffset: number,
  { size, unit }: { size: number, unit: Unit },
  type: Types
): HighlandStreamT<HeatMapEntries> => {
  let buffer = [];
  const metric$ = highland((push, next) => {
    const [begin, end] = calculateRangeFromSizeAndUnit(
      size,
      unit,
      getServerMoment(timeOffset, new Date())
    );

    const params = getDurationParams(begin, end, buffer);

    const targetStream = getTargetStream(req);

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
      .tap(xs => buffer = xs)
      .zip(targetStream)
      .map(combineWithTargets)
      .map(filterDataByType(type))
      .flatten()
      .uniqBy(compareByTsAndId)
      .group('id')
      .map(Object.values)
      .map(sortOsts)
      .each(x => {
        push(null, x);
        next();
      });
  }).ratelimit(1, 10000);
  req.streams[req.id].push(metric$);
  return metric$;
};

export const getRangeStream = (
  req: Req,
  moreQs: Object,
  timeOffset: number,
  { startDate, endDate }: { startDate: string, endDate: string },
  type: Types
): HighlandStreamT<HeatMapEntries> => {
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
    .map(filterDataByType(type))
    .flatten()
    .uniqBy(compareByTsAndId)
    .group('id')
    .map(Object.values)
    .map(sortOsts);
};
