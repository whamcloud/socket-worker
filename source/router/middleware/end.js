// @flow

//
// Copyright (c) 2017 Intel Corporation. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.

import type { Req, Resp, Next } from './middleware-types';

export default (req: Req, resp: Resp, next: Next) => {
  if (req.type !== 'end' || !req.connections[req.id]) return next(req, resp);
  req.connections[req.id].forEach(c => {
    if (typeof c.destroy === 'function') c.destroy();
    else c.end();
  });
  delete req.connections[req.id];
};
