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

export const getServerMoment = (SERVER_TIME_DIFF:number, date:Date) => {
  let d = new Date(date.getTime());
  d.setMilliseconds(d.getMilliseconds() + SERVER_TIME_DIFF);

  return d;
};

export type Unit = 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years';

export const adjustDateFromSizeAndUnit = (
  SERVER_TIME_DIFF: number,
  operation: 'add' | 'subtract' = 'subtract',
  size: number,
  unit: Unit,
  d: Date,
) => {
  let date = new Date(d.getTime());
  const calculate = (x, size) => {
    switch(operation) {
    case 'add':
      return x + size;
    case 'subtract':
      return x - size;
    default:
      throw new Error('must pass in a valid operation.');
    };
  };

  switch (unit) {
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
      date.setMonth(calculate(date.getMonth(), size), date.getDate());
      break;
    case 'years':
      date.setFullYear(calculate(date.getFullYear(), size));
      break;
    default:
      throw new Error(`${unit} is not a valid unit.`);
  }

  return date;
};

export const calculateRangeFromSizeAndUnit = (
  SERVER_TIME_DIFF: number,
  size: number,
  unit: Unit,
  date:Date
) => {
  const adjustDateByOperation = adjustDateFromSizeAndUnit.bind(null, SERVER_TIME_DIFF);
  const addToDate = adjustDateByOperation.bind(null, 'add');
  const subtractFromDate = adjustDateByOperation.bind(null, 'subtract');

  let dateClone = new Date(date.getTime());
  const d = getServerMoment(SERVER_TIME_DIFF, dateClone);
  let end = new Date(getServerMoment(SERVER_TIME_DIFF, dateClone).setMilliseconds(0));
  const secs = end.getSeconds();

  end.setSeconds(secs - secs % 10);
  end = new Date(addToDate(10, 'seconds', end).toISOString());

  const setBeginTime = fp.flow(
    subtractFromDate.bind(null, size, unit),
    subtractFromDate.bind(null, 10, 'seconds')
  );
  const start = setBeginTime(end);

  return [start, end];
};
