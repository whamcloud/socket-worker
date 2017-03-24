// @flow

export type Types =
  | 'stats_read_bytes'
  | 'stats_write_bytes'
  | 'stats_read_iops'
  | 'stats_write_iops';

export type Target = {
  id: string,
  name: string
};

export type PointsObj = {
  [id: number]: { data: HeatMapData, ts: string }[]
};
export type HeatMapData = {
  filesfree?: number,
  filestotal?: number,
  kbytesavail?: number,
  kbytesfree?: number,
  kbytestotal?: number,
  num_exports?: number,
  stats_connect?: number,
  stats_create?: number,
  stats_get_info?: number,
  stats_read_bytes?: number,
  stats_read_iops?: number,
  stats_set_info_async?: number,
  stats_statfs?: number,
  stats_write_bytes?: number,
  stats_write_iops?: number,
  tot_dirty?: number,
  tot_granted?: number,
  tot_pending?: number
};
export type HeatMapEntry = {
  data: HeatMapData,
  id: string,
  name: string,
  ts: string
};
export type HeatMapEntries = HeatMapEntry[];
