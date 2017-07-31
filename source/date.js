// @flow

//
// Copyright (c) 2017 Intel Corporation. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.

import * as fp from '@iml/fp';
import * as math from '@iml/math';

export type Unit =
  | 'milliseconds'
  | 'seconds'
  | 'minutes'
  | 'hours'
  | 'days'
  | 'weeks'
  | 'months'
  | 'years';

type DateOperations = 'add' | 'subtract';

const generateOperation = (
  operation: DateOperations
): ((a: number, b: number) => number) => {
  switch (operation) {
    case 'add':
      return math.add;
    case 'subtract':
      return math.minus;
    default:
      return math.minus;
  }
};

export const adjustDateFromSizeAndUnit = (
  operation: DateOperations = 'subtract',
  size: number,
  unit: Unit,
  d: Date
): Date => {
  const date = new Date(d.getTime());
  const calculate = generateOperation(operation);

  switch ((unit: Unit)) {
    case 'milliseconds':
      date.setMilliseconds(calculate(date.getMilliseconds(), size));
      break;
    case 'seconds':
      date.setSeconds(calculate(date.getSeconds(), size));
      break;
    case 'minutes':
      date.setMinutes(calculate(date.getMinutes(), size));
      break;
    case 'hours':
      date.setHours(calculate(date.getHours(), size));
      break;
    case 'days':
      date.setDate(calculate(date.getDate(), size));
      break;
    case 'weeks':
      date.setDate(calculate(date.getDate(), size * 7));
      break;
    case 'months':
      date.setUTCMonth(calculate(date.getUTCMonth(), size), date.getUTCDate());
      break;
    case 'years':
      date.setFullYear(calculate(date.getFullYear(), size));
      break;
    default:
      throw new Error(`${unit} is not a valid unit.`);
  }

  return date;
};

export const getServerMoment = (SERVER_TIME_DIFF: number, date: Date): Date =>
  adjustDateFromSizeAndUnit('add', SERVER_TIME_DIFF, 'milliseconds', date);

export const calculateRangeFromSizeAndUnit = (
  size: number,
  unit: Unit,
  end: Date
): [string, string] => {
  const addToDate = adjustDateFromSizeAndUnit.bind(null, 'add');
  const subtractFromDate = adjustDateFromSizeAndUnit.bind(null, 'subtract');
  end.setMilliseconds(0);
  const secs = end.getSeconds();

  end.setSeconds(secs - secs % 10);
  end = addToDate(10, 'seconds', end);

  const setBeginTime = fp.flow(
    subtractFromDate.bind(null, size, unit),
    subtractFromDate.bind(null, 10, 'seconds')
  );
  const start = setBeginTime(end);

  return [start.toISOString(), end.toISOString()];
};

export const getDurationParams = (
  begin: string,
  end: string,
  buffer: Object[]
): { end: string, begin: string, update: boolean } => {
  let params = {};

  if (buffer.length === 0) {
    params = {
      begin,
      end,
      update: false
    };
  } else {
    const latestDate = buffer[buffer.length - 1].ts;

    params = {
      end: latestDate,
      begin: new Date().toISOString(),
      update: true
    };
  }

  return params;
};
