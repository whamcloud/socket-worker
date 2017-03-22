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

import * as fp from '@iml/fp';
import { default as highland, type HighlandStreamT } from 'highland';
import {
  objToPoints,
  appendWithBuff,
  compareByTsAndId,
  sort
} from './transforms.js';
import {
  calculateRangeFromSizeAndUnit,
  getServerMoment,
  getDurationParams
} from '../../../date.js';

import router from '../../index.js';

export const getTargetStream = req =>
  req
    .getOne$({
      path: '/target',
      options: {
        qs: { limit: 0 },
        jsonMask: 'objects(id,name)'
      }
    })
    .map(x => x.objects);

export const durationStream = (req, moreQs, timeOffset, { size, unit }) => {
  let buffer = [];
  highland((push, next) => {
    let [begin, end] = calculateRangeFromSizeAndUnit(
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
      .flatten()
      .uniqBy(compareByTsAndId)
      .group('id')
      .map(Object.values)
      .map(sort)
      .each(function pushData(x) {
        push(null, x);
        next();
      });
  }).ratelimit(1, 10000);
};

const getRangeStream = (req, moreQs, timeOffset, { begin, end }) => {
  const targetStream = getTargetStream(req);
  begin = getServerMoment(timeOffset, new Date(begin)).toISOString();
  end = getServerMoment(timeOffset, new Date(end)).toISOString();

  req
    .getOne$({
      path: '/target/metric',
      options: {
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
    .flatten()
    .uniqBy(compareByTsAndId)
    .group('id')
    .map(Object.values)
    .map(sort);
};
