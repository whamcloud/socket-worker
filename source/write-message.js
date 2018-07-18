// @flow

//
// Copyright (c) 2017 DDN. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.

import type { Self } from './route-by-data.js';

export default (self: Self, id: string) => (payload: Object): void =>
  self.postMessage({
    type: 'message',
    id,
    payload
  });
