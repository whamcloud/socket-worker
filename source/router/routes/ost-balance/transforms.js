// @flow

//
// Copyright (c) 2017 Intel Corporation. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.

import * as fp from '@iml/fp';
import { formatBytes } from '@iml/number-formatters';

import type { Target } from './route.js';

type InputDataObj = {
  [string]: InputData[]
};

type InputData = {|
  data: Data,
  ts: string
|};

type Data = {
  kbytesfree: number,
  kbytestotal: number
};

type Detail = {
  bytesFree: string,
  bytesTotal: string,
  bytesUsed: string,
  percentFree: number,
  percentUsed: number
};

export type OutputOstData = {
  detail: Detail,
  free: number,
  kbytesfree: number,
  kbytestotal: number,
  used: number,
  x: string
};

const asPercentage = fp.flow(
  x => x * 100,
  Math.round
);

const asFormattedBytes = fp.flow(
  x => x * 1024,
  x => formatBytes(x, 4)
);

const filterByLen = fp.filter(
  ([, xs]: [string, Array<InputData>][]): boolean => xs.length > 0
);

const takeLast = ([k, xs]: [string, Array<InputData>]): [string, InputData] => [
  k,
  xs[xs.length - 1]
];

const cleanData = ([x, { data }]: [string, InputData]) => ({
  ...data,
  x
});

const addFree = data => ({
  ...data,
  free: data.kbytesfree / data.kbytestotal
});

const addUsed = data => ({
  ...data,
  used: 1 - data.free
});

const addDetail = (data): OutputOstData => ({
  ...data,
  detail: {
    percentFree: asPercentage(data.free),
    percentUsed: asPercentage(data.used),
    bytesFree: asFormattedBytes(data.kbytesfree),
    bytesUsed: asFormattedBytes(data.kbytestotal - data.kbytesfree),
    bytesTotal: asFormattedBytes(data.kbytestotal)
  }
});

type EntriesFn = (o: InputDataObj) => [string, Array<InputData>][];

type TransformMetrics = InputDataObj => OutputOstData[];
export const transformMetrics: TransformMetrics = fp.flow(
  ((Object.entries: any): EntriesFn),
  filterByLen,
  fp.map(
    fp.flow(
      takeLast,
      cleanData,
      addFree,
      addUsed,
      addDetail
    )
  )
);

export const combineWithTargets = ([ostBalanceMetrics, targets]: [
  OutputOstData[],
  Target[]
]) =>
  ostBalanceMetrics.map(v => ({
    ...v,
    x: (targets.find(t => t.id === v.x) || { name: v.x }).name
  }));

export const toNvd3 = (xs: OutputOstData[]) =>
  xs.reduce(
    (acc, x) => {
      acc[0].values.push({
        x: x.x,
        y: x.used,
        detail: x.detail
      });

      acc[1].values.push({
        x: x.x,
        y: x.free,
        detail: x.detail
      });

      return acc;
    },
    [{ key: 'Used bytes', values: [] }, { key: 'Free bytes', values: [] }]
  );

const cmp = ({ x }, { x: y }) => x.localeCompare(y);
export const sort = fp.tap(({ values }) => values.sort(cmp));
