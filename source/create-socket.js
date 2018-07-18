// @flow

//
// Copyright (c) 2017 DDN. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.

import { default as io, type SocketIoClient } from 'socket.io-client';

export default (url: string, workerContext: self): SocketIoClient => {
  const socket = io(url);

  socket.on('reconnecting', attempt => {
    workerContext.postMessage({
      type: 'reconnecting',
      data: attempt
    });
  });

  socket.on('reconnect', attempt => {
    workerContext.postMessage({
      type: 'reconnect',
      data: attempt
    });
  });

  socket.once('error', err => {
    workerContext.postMessage({
      type: 'error',
      data: err
    });

    socket.disconnect();
  });

  socket.once('disconnect', () => {
    workerContext.postMessage({
      type: 'disconnect'
    });
  });

  return socket;
};
