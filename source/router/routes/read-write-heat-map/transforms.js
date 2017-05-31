// @flow

//
// Copyright (c) 2017 Intel Corporation. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.

import * as fp from '@mfl/fp';

import type {
  Target,
  PointsObj,
  HeatMapEntry,
  HeatMapEntries,
  HeatMapData
} from './route.js';

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
