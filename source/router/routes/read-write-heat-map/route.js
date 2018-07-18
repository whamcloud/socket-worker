// @flow

//
// Copyright (c) 2018 DDN. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.

import * as streams from './streams.js';
import router from '../../index.js';

import type { Resp, Next } from '../../middleware/middleware-types.js';

import type { Unit } from '../../../date.js';
import type { Payload, Options } from '../../../route-by-data.js';
import type { Req } from '../../middleware/middleware-types.js';

export type Types =
  | 'stats_read_bytes'
  | 'stats_write_bytes'
  | 'stats_read_iops'
  | 'stats_write_iops';

export type Target = {
  +id: string,
  +name: string
};

export type MoreQs = {
  +filesystem_id?: string,
  +id?: string,
  +metrics: Types
};

interface HeatMapOptions extends Options {
  +qs: MoreQs;
  +durationParams: ?{ size: number, unit: Unit };
  +rangeParams: ?{ startDate: string, endDate: string };
  +timeOffset: number;
}

interface HeatMapPayload extends Payload {
  +options: HeatMapOptions;
}

export interface HeatMapRequest extends Req {
  +payload: HeatMapPayload;
}

export type PointsObj = {
  [id: number]: { data: HeatMapData, ts: string }[]
};
export type HeatMapData = {
  +stats_read_bytes?: number,
  +stats_read_iops?: number,
  +stats_write_bytes?: number,
  +stats_write_iops?: number
};
export type HeatMapEntry = {
  +data: HeatMapData,
  +id: string,
  +name: string,
  +ts: string
};
export type HeatMapEntries = HeatMapEntry[];

export default () => {
  router.get(
    '/read-write-heat-map',
    (req: HeatMapRequest, resp: Resp, next: Next) => {
      const {
        payload: {
          options: { qs: moreQs, durationParams, rangeParams, timeOffset }
        }
      } = req;

      if (durationParams)
        streams
          .getDurationStream(req, moreQs, timeOffset, durationParams)
          .each(resp.write);
      else if (rangeParams)
        streams
          .getRangeStream(req, moreQs, timeOffset, rangeParams)
          .each(resp.write);

      next(req, resp);
    }
  );
};
