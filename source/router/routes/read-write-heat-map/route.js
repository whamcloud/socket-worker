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
import { type HighlandStreamT } from 'highland';
import {
  objToPoints
} from './transforms.js';

import router from '../../index.js';

export default () => {
  router.get('/read-write-heat-map', (req, resp, next) => {
    const targetStream = req
      .getOne$({
        path: '/target',
        options: {
          qs: { limit: 0 },
          jsonMask: 'objects(id,name)'
        }
      })
      .map(x => x.objects);

    const { payload: { options: { qs: moreQs = {}, percentage, size, unit } } } = req;

    const readWriteHeatMapStream: HighlandStreamT<OutputOstData[]> = req
      .getOne$({
        path: '/target/metric',
        options: {
          qs: {
            kind: 'OST',
            metrics: 'kbytestotal,kbytesfree',
            latest: true,
            ...moreQs
          }
        }
      })
      .map(objToPoints)
      .through(buff(size, unit))
      .through(unionWithTarget)
      .through(requestRange.setLatest)
      .flatten()
      .through(removeDupsBy(fp.eqFn(idLens, idLens)))
      .group('id')
      .map(values)
      .map(sortOsts)
      .each(resp.write);

    next(req, resp);
  });
};
