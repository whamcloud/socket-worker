// @flow

//
// Copyright (c) 2017 DDN. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.

import type { Req, Resp, Next, Connections } from './middleware-types.js';

const connections: Connections = {};

export default (req: Req, resp: Resp, next: Next) => {
  connections[req.id] = connections[req.id] || [];
  req.connections = connections;

  if (req.type !== 'connect') next(req, resp);
};
