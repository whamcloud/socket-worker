// @flow

//
// Copyright (c) 2018 DDN. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.

import { one, many } from '../../socket-stream.js';
import getMultiplexedSocket from '../../multiplexed-socket.js';

import type { Payload } from '../../route-by-data.js';
import type { Req, Resp, Next } from './middleware-types';

export default (req: Req, resp: Resp, next: Next) => {
  req.getOne$ = (payload: Payload) => {
    const socket = getMultiplexedSocket(resp.socket);
    req.connections[req.id].push(socket);

    return one(socket)(payload);
  };

  req.getMany$ = (payload: Payload) => {
    const socket = getMultiplexedSocket(resp.socket);
    req.connections[req.id].push(socket);

    return many(socket)(payload);
  };

  next(req, resp);
};
