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

import router from './router/index.js';
import writeMessage from './write-message.js';

import { type MultiplexedSocketInterface } from './multiplexed-socket.js';

export interface Options {
  +method: 'get' | 'post' | 'put' | 'patch' | 'delete',
  +qs: Object
}

export interface Payload {
  +path?: string,
  +options?: Options
}

type Data = {
  payload?: Payload,
  id: string,
  ack?: boolean,
  type: string
};

export type Self = {
  postMessage: (
    {
      type: 'message',
      id: string,
      payload: Payload
    }
  ) => void
};

export default (self: Self, socket: MultiplexedSocketInterface) =>
  ({ data }: { data: Data }): void => {
    const {
      payload = {},
      id,
      ack = false,
      type
    } = data;
    const {
      path = '/noop',
      options: { method: verb = router.verbs.GET } = {}
    } = payload;

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
