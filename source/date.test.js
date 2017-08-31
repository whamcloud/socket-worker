// @flow

import { describe, it, beforeEach, expect } from './jasmine.js';

import {
  adjustDateFromSizeAndUnit,
  calculateRangeFromSizeAndUnit,
  type Unit
} from './date.js';

describe('date', () => {
  let date: Date;
  let subtractDate: (size: number, unit: Unit, date: Date) => Date;
  let addDate: (size: number, unit: Unit, date: Date) => Date;
  let result;

  beforeEach(() => {
    date = new Date('2017-12-17T03:24:00.000Z');
    subtractDate = adjustDateFromSizeAndUnit.bind(null, 'subtract');
    addDate = adjustDateFromSizeAndUnit.bind(null, 'add');
  });

  it('should subtract seconds and roll back to the previous hour', () => {
    result = subtractDate(2, 'seconds', date);
    expect(result.toISOString()).toEqual('2017-12-17T03:23:58.000Z');
  });

  it('should add seconds to the date', () => {
    result = addDate(15, 'seconds', date);
    expect(result.toISOString()).toEqual('2017-12-17T03:24:15.000Z');
  });

  it('should subtract minutes within the same hour', () => {
    result = subtractDate(2, 'minutes', date);
    expect(result.toISOString()).toEqual('2017-12-17T03:22:00.000Z');
  });

  it('should subtract minutes and rollback to the previous hour', () => {
    result = subtractDate(25, 'minutes', date);
    expect(result.toISOString()).toEqual('2017-12-17T02:59:00.000Z');
  });

  it('should add minutes to the date', () => {
    result = addDate(15, 'minutes', date);
    expect(result.toISOString()).toEqual('2017-12-17T03:39:00.000Z');
  });

  it('should subtract hours within the same date', () => {
    result = subtractDate(2, 'hours', date);
    expect(result.toISOString()).toEqual('2017-12-17T01:24:00.000Z');
  });

  it('should subtract hours and rollback to the previous date', () => {
    result = subtractDate(7, 'hours', date);
    expect(result.toISOString()).toEqual('2017-12-16T20:24:00.000Z');
  });

  it('should add hours to the date', () => {
    result = addDate(1, 'hours', date);
    expect(result.toISOString()).toEqual('2017-12-17T04:24:00.000Z');
  });

  it('should subtract days from the date within the same month', () => {
    result = subtractDate(2, 'days', date);
    expect(result.toISOString()).toEqual('2017-12-15T03:24:00.000Z');
  });

  it('should subtract days from the date and roll back to previous month', () => {
    result = subtractDate(18, 'days', date);
    expect(result.toISOString()).toEqual('2017-11-29T03:24:00.000Z');
  });

  it('should add days to the date', () => {
    result = addDate(1, 'days', date);
    expect(result.toISOString()).toEqual('2017-12-18T03:24:00.000Z');
  });

  it('should subtract weeks from the date within the same month', () => {
    result = subtractDate(1, 'weeks', date);
    expect(result.toISOString()).toEqual('2017-12-10T03:24:00.000Z');
  });

  it('should subtract weeks from the date and roll back to previous month', () => {
    result = subtractDate(3, 'weeks', date);
    expect(result.toISOString()).toEqual('2017-11-26T03:24:00.000Z');
  });

  it('should add weeks to the date', () => {
    result = addDate(1, 'weeks', date);
    expect(result.toISOString()).toEqual('2017-12-24T03:24:00.000Z');
  });

  it('should subtract months from the date within the current year', () => {
    result = subtractDate(2, 'months', date);
    // hour changes from 03 to 02 due to DST
    expect(result.toISOString()).toEqual('2017-10-17T03:24:00.000Z');
  });

  it('should subtract months from the date and roll back to previous year', () => {
    result = subtractDate(13, 'months', date);
    expect(result.toISOString()).toEqual('2016-11-17T03:24:00.000Z');
  });

  it('should add months to the date', () => {
    result = addDate(1, 'months', date);
    expect(result.toISOString()).toEqual('2018-01-17T03:24:00.000Z');
  });

  it('should subtract years from the date', () => {
    result = subtractDate(2, 'years', date);
    expect(result.toISOString()).toEqual('2015-12-17T03:24:00.000Z');
  });

  it('should add years to the date', () => {
    result = addDate(1, 'years', date);
    expect(result.toISOString()).toEqual('2018-12-17T03:24:00.000Z');
  });
});

describe('calculate range from size and unit', () => {
  let date, start, end;
  beforeEach(() => {
    date = new Date('2017-12-17T03:24:00.000Z');
    [start, end] = calculateRangeFromSizeAndUnit(10, 'minutes', date);
  });

  it('should have a start time', () => {
    expect(start).toEqual('2017-12-17T03:14:00.000Z');
  });

  it('should have an end time', () => {
    expect(end).toEqual('2017-12-17T03:24:10.000Z');
  });
});
