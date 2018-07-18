// @flow

//
// Copyright (c) 2017 DDN. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.

import { type MultiplexedSocketInterface } from '../../multiplexed-socket.js';
import { type StreamFn } from '../../socket-stream.js';
import { type Payload } from '../../route-by-data.js';
import { type HighlandStreamT } from 'highland';

export type Connections = {
  [id: string]: Array<MultiplexedSocketInterface | HighlandStreamT<*>>
};

export interface Req {
  +id: string;
  connections: Connections;
  +type: 'connect' | 'end';
  getOne$: StreamFn<*>;
  getMany$: StreamFn<*>;
  +payload: Payload;
}

export type Resp = {
  socket: MultiplexedSocketInterface,
  write: mixed => void
};

export type Next = (req: Req, resp: Resp) => void;
