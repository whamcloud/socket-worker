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

import highland from 'highland';
import { type HighlandStreamT } from 'highland';
import * as fp from '@iml/fp';

type PointsObj = {
  [id: number]: { data: Object }[]
};
type FlattenedPoints = { data: Object, id: string, name: string }[];

export const objToPoints: (
  points: PointsObj
) => FlattenedPoints = fp.flow(
  Object.entries,
  fp.map(([k: string, xs: { data: Object }[]]) =>
    xs.map((x: Object) => ({ ...x, id: k, name: k }))),
  xs => [].concat(...xs)
);

const concatWithBuff = buffer => xs => buffer.concat(xs);
const filterWithLeadingEdge = leadingEdge =>
  fp.filter(({ ts }) => new Date(ts).valueOf() >= leadingEdge);
const sortWithTs = xs =>
  xs.sort(({ ts }, { ts: tsy }) => new Date(ts) - new Date(tsy));
export const compareByTsAndId = (a, b) => a.ts === b.ts && a.id === b.id;
const cmp = ({ name }, { name: nameY }) => name.localeCompare(nameY);
export const sort = fp.tap(xs => xs.sort(cmp));

export const appendWithBuff = (buffer, leadingEdge) =>
  fp.flow(
    concatWithBuff(buffer),
    filterWithLeadingEdge(leadingEdge),
    sortWithTs
  );
