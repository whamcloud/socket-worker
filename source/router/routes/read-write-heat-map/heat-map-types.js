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

import type { Unit } from '../../../date.js';
import type { BaseReq } from '../../middleware/middleware-types.js';

export type Types =
  | 'stats_read_bytes'
  | 'stats_write_bytes'
  | 'stats_read_iops'
  | 'stats_write_iops';

export type Target = {
  id: string,
  name: string
};

export type MoreQs = {
  filesystem_id?: string,
  metrics: Types
};

export interface HeatMapRequest extends BaseReq {
  payload: {
    options: {
      qs: MoreQs,
      durationParams: ?{ size: number, unit: Unit },
      rangeParams: ?{ startDate: string, endDate: string },
      timeOffset: number
    }
  }
}

export type PointsObj = {
  [id: number]: { data: HeatMapData, ts: string }[]
};
export type HeatMapData = {
  filesfree?: number,
  filestotal?: number,
  kbytesavail?: number,
  kbytesfree?: number,
  kbytestotal?: number,
  num_exports?: number,
  stats_connect?: number,
  stats_create?: number,
  stats_get_info?: number,
  stats_read_bytes?: number,
  stats_read_iops?: number,
  stats_set_info_async?: number,
  stats_statfs?: number,
  stats_write_bytes?: number,
  stats_write_iops?: number,
  tot_dirty?: number,
  tot_granted?: number,
  tot_pending?: number
};
export type HeatMapEntry = {
  data: HeatMapData,
  id: string,
  name: string,
  ts: string
};
export type HeatMapEntries = HeatMapEntry[];
