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

import getEventSocket from './get-event-socket.js';
import router from './router/index.js';

export default function getEventSocketHandler(
  socket: Object,
  workerContext: typeof self
): void {
  const eventSockets = {};

  workerContext.addEventListener('message', handler, false);

  function handler({ data }) {
    const type = data.type;

    if (type === 'connect') onConnect(data);
    else if (type === 'send') onSend(data);
    else if (type === 'end') onEnd(data);
  }

  function onConnect({ id }) {
    if (eventSockets[id]) return;

    eventSockets[id] = getEventSocket(socket, id);
  }

  function onSend({ payload, id, ack }) {
    const { path } = payload;
    const options = payload.options || {};
    const verb = options.method || router.verbs.GET;

    const socket = eventSockets[id];

    if (!socket) return;

    router.go(
      path,
      {
        verb,
        payload,
        isAck: ack
      },
      {
        socket,
        write
      }
    );

    function write(payload) {
      workerContext.postMessage({
        type: 'message',
        id,
        payload
      });
    }
  }

  function onEnd({ id }) {
    if (!eventSockets[id]) return;

    eventSockets[id].end();
    delete eventSockets[id];
  }
}
