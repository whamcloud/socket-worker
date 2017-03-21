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
import { formatBytes } from '@iml/number-formatters';

type InputDataObj = {
  [string]: InputData[]
};

type InputData = {|
  'data': Data,
  'ts': string
|};

type Data = {
  'kbytesfree': number,
  'kbytestotal': number
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

const asPercentage = fp.flow(x => x * 100, Math.round);

const asFormattedBytes = fp.flow(x => x * 1024, x => formatBytes(x, 4));

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

type TransformMetrics = (InputDataObj) => OutputOstData[];
export const transformMetrics: TransformMetrics = fp.flow(
  ((Object.entries: any): EntriesFn),
  filterByLen,
  fp.map(fp.flow(takeLast, cleanData, addFree, addUsed, addDetail))
);

type Target = {
  id: string,
  name: string
};

export const combineWithTargets = (
  [ostBalanceMetrics, targets]: [OutputOstData[], Target[]]
) =>
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
