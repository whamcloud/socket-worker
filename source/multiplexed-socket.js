// @flow

//
// INTEL CONFIDENTIAL
//
// Copyright 2013-2017 Intel Corporation All Rights Reserved.
//
// The source code contained or described herein and all documents related
// to the source code ("Material") are owned by Intel Corporation or its
// suppliers or licensors. Title to the Material remains with Intel Corporation
// or its suppliers and licensors. The Material contains trade secrets and
// proprietary and confidential information of Intel or its suppliers and
// licensors. The Material is protected by worldwide copyright and trade secret
// laws and treaty provisions. No part of the Material may be used, copied,
// reproduced, modified, published, uploaded, posted, transmitted, distributed,
// or disclosed in any way without Intel's prior express written permission.
//
// No license under any patent, copyright, trade secret or other intellectual
// property right is granted to or conferred upon you by disclosure or delivery
// of the Materials, either expressly, by implication, inducement, estoppel or
// otherwise. Any license under such intellectual property rights must be
// express and approved by Intel in writing.

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
  end(): void,
  onDestroy(): void,
  emit(string, Object, fn: ?Function): MultiplexedSocketInterface,
  on(name: string, fn: Function): MultiplexedSocketInterface,
  onReconnect(): void
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
