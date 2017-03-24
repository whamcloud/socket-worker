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

import type {
  Types,
  Target,
  PointsObj,
  HeatMapEntries,
  HeatMapEntry,
  HeatMapData
} from './heat-map-types.js';

export const objToPoints: (
  points: PointsObj
) => HeatMapEntries = fp.flow(
  Object.entries,
  fp.map(([k: string, xs: { data: HeatMapData }[]]) =>
    xs.map((x: Object) => ({ ...x, id: k, name: k }))),
  xs => [].concat(...xs)
);

export const concatWithBuff = (buffer: HeatMapEntries) =>
  (xs: HeatMapEntries): HeatMapEntries => buffer.concat(xs);

export const filterWithLeadingEdge = (leadingEdge: string) =>
  (xs: HeatMapEntries): HeatMapEntries =>
    fp.filter(
      ({ ts }) => new Date(ts).valueOf() >= new Date(leadingEdge).valueOf()
    )(xs);

export const sortWithTs = (xs: HeatMapEntries): HeatMapEntries =>
  xs.sort(({ ts: tsx }, { ts: tsy }) => new Date(tsx) - new Date(tsy));
export const compareByTsAndId = (a: HeatMapEntry, b: HeatMapEntry): boolean =>
  a.ts === b.ts && a.id === b.id;
const cmp = (
  [{ name: namex }]: HeatMapEntries,
  [{ name: namey }]: HeatMapEntries
): number => namex.localeCompare(namey);
export const sortOsts = (xs: HeatMapEntries[]): HeatMapEntries[] =>
  xs.sort(cmp);
export const appendWithBuff = (
  buffer: HeatMapEntries,
  leadingEdge: string
): (xs: HeatMapEntries) => HeatMapEntries =>
  fp.flow(
    concatWithBuff(buffer),
    filterWithLeadingEdge(leadingEdge),
    sortWithTs
  );

export const combineWithTargets = (
  [heatMapMetrics, targets]: [HeatMapEntries, Target[]]
): HeatMapEntries =>
  heatMapMetrics.map(v => ({
    ...v,
    name: (targets.find(t => t.id === v.id) || { name: v.name }).name
  }));

export const filterDataByType = (type: Types) =>
  (data: HeatMapEntries): HeatMapEntries =>
    data.map(v => ({
      ...v,
      data: { [type]: v.data[type] }
    }));
