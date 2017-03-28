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

type PointsObj = {
  [id: number]: { data: Object }[]
};
type HeatMapData = {
  filesfree: number,
  filestotal: number,
  kbytesavail: number,
  kbytesfree: number,
  kbytestotal: number,
  num_exports: number,
  stats_connect: number,
  stats_create: number,
  stats_get_info: number,
  stats_read_bytes: number,
  stats_read_iops: number,
  stats_set_info_async: number,
  stats_statfs: number,
  stats_write_bytes: number,
  stats_write_iops: number,
  tot_dirty: number,
  tot_granted: number,
  tot_pending: number
};
type HeatMapEntry = { data: HeatMapData, id: string, name: string, ts: string };
type HeatMapEntries = HeatMapEntry[];

export const objToPoints: (
  points: PointsObj
) => HeatMapEntries = fp.flow(
  Object.entries,
  fp.map(([k: string, xs: { data: Object }[]]) =>
    xs.map((x: Object) => ({ ...x, id: k, name: k }))),
  xs => [].concat(...xs)
);

const concatWithBuff = buffer => xs => buffer.concat(xs);
const filterWithLeadingEdge = leadingEdge =>
  entry =>
    fp.filter(
      ({ ts }) => new Date(ts).valueOf() >= new Date(leadingEdge).valueOf()
    )(entry);
const sortWithTs = xs =>
  xs.sort(({ ts }, { ts: tsy }) => new Date(ts) - new Date(tsy));
export const compareByTsAndId = (
  a: { ts: string, id: string },
  b: { ts: string, id: string }
) => a.ts === b.ts && a.id === b.id;
const cmp = (
  [{ name: namex }]: HeatMapEntries,
  [{ name: namey }]: HeatMapEntries
) => namex.localeCompare(namey);
export const sortOsts = (xs: HeatMapEntries[]) => xs.sort(cmp);
export const appendWithBuff = (buffer, leadingEdge) =>
  fp.flow(
    concatWithBuff(buffer),
    filterWithLeadingEdge(leadingEdge),
    sortWithTs
  );

type Target = {
  id: string,
  name: string
};
export const combineWithTargets = (
  [heatMapMetrics, targets]: [HeatMapEntries, Target[]]
) =>
  heatMapMetrics.map(v => ({
    ...v,
    name: (targets.find(t => t.id === v.id) || { name: v.name }).name
  }));

type Types =
  | 'stats_read_bytes'
  | 'stats_write_bytes'
  | 'stats_read_iops'
  | 'stats_write_iops';
export const filterDataByType = (type: Types) =>
  (data: HeatMapEntries) =>
    data.map(v => ({
      ...v,
      data: { [type]: v.data[type] }
    }));
