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

import * as fp from '@mfl/fp';
import {
  transformMetrics,
  type OutputOstData,
  combineWithTargets,
  toNvd3,
  sort
} from './transforms.js';

import router from '../../index.js';

import { type HighlandStreamT } from 'highland';
import type { Resp, Next } from '../../middleware/middleware-types.js';

import type { Payload, Options } from '../../../route-by-data.js';
import type { Req } from '../../middleware/middleware-types.js';

export type MoreQs = {
  +filesystem_id?: string,
  +id?: string
};

interface OstOptions extends Options {
  +qs: MoreQs,
  +percentage: number
}

interface OstPayload extends Payload {
  +options: OstOptions
}

export interface OstRequest extends Req {
  +payload: OstPayload
}

export type Target = {
  +id: string,
  +name: string
};

export default () => {
  router.get('/ost-balance', (req: OstRequest, resp: Resp, next: Next) => {
    const targetStream: HighlandStreamT<Target[]> = req
      .getOne$({
        path: '/target',
        options: {
          method: 'get',
          qs: { limit: 0 },
          jsonMask: 'objects(id,name)'
        }
      })
      .map(x => x.objects);

    const { payload: { options: { qs: moreQs = {}, percentage } } } = req;

    const ostBalanceStream: HighlandStreamT<OutputOstData[]> = req
      .getOne$({
        path: '/target/metric',
        options: {
          method: 'get',
          qs: {
            kind: 'OST',
            metrics: 'kbytestotal,kbytesfree',
            latest: true,
            ...moreQs
          }
        }
      })
      .map(
        fp.flow(
          transformMetrics,
          fp.filter((x: OutputOstData) => x.detail.percentUsed >= percentage)
        )
      );

    ostBalanceStream
      .zip(targetStream)
      .map(fp.flow(combineWithTargets, toNvd3, sort))
      .each(resp.write);

    next(req, resp);
  });
};
