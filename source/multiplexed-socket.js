// @flow

//
// Copyright (c) 2017 Intel Corporation. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.

import getRandomValue from './get-random-value.js';
import { type SocketIoClient } from 'socket.io-client';
import { noop } from '@iml/fp';

const emptySocket = {
  on: noop,
  off: noop,
  removeAllListeners: noop,
  emit: noop,
  disconnect: noop
};

export interface MultiplexedSocketInterface {
  end(): void;
  onDestroy(): void;
  emit(string, Object, fn: ?Function): MultiplexedSocketInterface;
  on(name: string, fn: Function): MultiplexedSocketInterface;
  onReconnect(): void;
}

class MultiplexedSocket implements MultiplexedSocketInterface {
  id: string;
  socket: SocketIoClient = emptySocket;
  lastSend: ?Array<any>;
  names: Set<string> = new Set();
  constructor(socket: SocketIoClient, id: string) {
    this.id = id;
    this.socket = socket;

    socket.once('destroy', this.onDestroy.bind(this));
    socket.on('reconnect', this.onReconnect.bind(this));
  }
  end() {
    this.socket.emit(`end${this.id}`);
    this.onDestroy();
    this.socket = emptySocket;
  }
  onDestroy() {
    this.socket.removeAllListeners(`message${this.id}`);
    this.socket.off('reconnect', this.onReconnect.bind(this));
  }
  emit(name: string, data: Object, ack: ?Function) {
    if (typeof ack !== 'function') this.lastSend = arguments;

    const nameWithId = `${name}${this.id}`;
    this.names.add(nameWithId);

    this.socket.emit(nameWithId, data, ack);
    return this;
  }
  on(name: string, fn: Function) {
    this.socket.on(`${name}${this.id}`, fn);
    return this;
  }
  onReconnect() {
    if (this.lastSend) this.emit(...this.lastSend);
  }
}

export default (socket: any): MultiplexedSocket =>
  new MultiplexedSocket(socket, getRandomValue());
