// @flow

//
// Copyright (c) 2018 DDN. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.

import createSocket from "./create-socket.js";
import routes from "./router/routes/index.js";
import routeByData from "./route-by-data.js";

routes.ostBalance();
routes.readWriteHeatMap();
routes.wildcard();

const socket = createSocket(self.location.origin, self);

self.addEventListener("message", routeByData(self, socket), false);
