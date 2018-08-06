// @flow

//
// Copyright (c) 2018 DDN. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.

import router from "./router/index.js";
import writeMessage from "./write-message.js";

import { type MultiplexedSocketInterface } from "./multiplexed-socket.js";

export interface Options {
  +method: "get" | "post" | "put" | "patch" | "delete";
  +qs: Object;
}

export interface Payload {
  +path?: string;
  +options?: Options;
}

type Data = {
  payload?: Payload,
  id: string,
  ack?: boolean,
  type: string
};

export type Self = {
  postMessage: ({
    type: "message",
    id: string,
    payload: Payload
  }) => void
};

export default (self: Self, socket: MultiplexedSocketInterface) => ({ data }: { data: Data }): void => {
  const { payload = {}, id, ack = false, type } = data;
  const { path = "/noop", options: { method: verb = router.verbs.GET } = {} } = payload;

  router.go(
    path,
    {
      verb,
      payload,
      id,
      type,
      isAck: ack
    },
    {
      socket,
      write: writeMessage(self, id)
    }
  );
};
