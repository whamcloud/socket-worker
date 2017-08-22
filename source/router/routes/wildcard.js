// @flow

//
// Copyright (c) 2017 Intel Corporation. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.

import router from '../index.js';
import { type Req, type Resp } from '../middleware/middleware-types.js';

const serializeError = (e: Object) => ({
  error: {
    statusCode: e.statusCode,
    message: e.message,
    name: e.name,
    stack: e.stack,
    signal: e.signal,
    code: e.code
  }
});

const onError = (err, push) => push(null, serializeError(err));

export default (): void => {
  router.all('/(.*)', (req: Req, resp: Resp, next) => {
    if (req.isAck) req.getOne$(req.payload).errors(onError).each(resp.write);
    else req.getMany$(req.payload).errors(onError).each(resp.write);

    next(req, resp);
  });
};
