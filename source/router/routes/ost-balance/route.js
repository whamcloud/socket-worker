// @flow

//
// Copyright (c) 2017 DDN. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.

import * as fp from '@iml/fp';
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
  +qs: MoreQs;
  +percentage: number;
}

interface OstPayload extends Payload {
  +options: OstOptions;
}

export interface OstRequest extends Req {
  +payload: OstPayload;
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

    const {
      payload: {
        options: { qs: moreQs = {}, percentage }
      }
    } = req;

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
      .map(
        fp.flow(
          combineWithTargets,
          toNvd3,
          sort
        )
      )
      .each(resp.write);

    next(req, resp);
  });
};
