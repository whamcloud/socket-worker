// @flow

//
// Copyright (c) 2017 DDN. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.

import getRouter from '@iml/router';
import connections from './middleware/connections.js';
import socketFactory from './middleware/socket-factory.js';
import end from './middleware/end.js';

export default getRouter()
  .addStart(connections)
  .addStart(socketFactory)
  .addStart(end);
