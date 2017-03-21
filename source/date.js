export const getServerMoment = SERVER_TIME_DIFF => {
  const d = new Date();

  d.setMilliseconds(d.getMilliseconds() + SERVER_TIME_DIFF);

  return d;
};

type Unit = 'hours' | 'days' | 'weeks' | 'months' | 'years';

export const adjustDateFromSizeAndUnit = (
  SERVER_TIME_DIFF: number,
  date: Date,
  size: number,
  unit: Unit
) => {
  switch (unit) {
    case 'hours':
      date.setHours(date.getHours() - size);
    case 'days':
      date.getDate(date.getDate() - size);
    case 'weeks':
      date.getDate(date.getDate() - size * 7);
    case 'months':
      date.getMonth(date.getMonth - size);
    case 'years':
      date.getFullYear(date.getFullYear - size);
  }

  return date;
};

export const calculateRangeFromSizeAndUnit = (
  SERVER_TIME_DIFF: number,
  size: number,
  unit: Unit
) => {
  const d = getServerMoment(SERVER_TIME_DIFF);
  const end = getServerMoment(SERVER_TIME_DIFF).setMilliseconds(0);

  const secs = end.getSeconds();
  end.setSeconds(secs - secs % 10);

  params.qs.end = end.clone().add(10, 'seconds').toISOString();

  params.qs.begin = end
    .subtract(size, unit)
    .subtract(10, 'seconds')
    .toISOString();
};
