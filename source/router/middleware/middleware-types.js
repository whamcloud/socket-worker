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
// or disclosed in any way without Intel's prior express writtaen permission.
//
// No license under any patent, copyright, trade secret or other intellectual
// property right is granted to or conferred upon you by disclosure or delivery
// of the Materials, either expressly, by implication, inducement, estoppel or
// otherwise. Any license under such intellectual property rights must be
// express and approved by Intel in writing.

import { type MultiplexedSocketInterface } from '../../multiplexed-socket.js';
import { type StreamFn } from '../../socket-stream.js';
import { type Payload } from '../../route-by-data.js';
import { type HighlandStreamT } from 'highland';

export type Connections = {
  [id: string]: Array<MultiplexedSocketInterface | HighlandStreamT<*>>
};

export interface Req {
  id: string,
  connections: Connections,
  type: 'connect' | 'end',
  getOne$: StreamFn<*>,
  getMany$: StreamFn<*>,
  +payload: Payload
}

export type Resp = {
  socket: MultiplexedSocketInterface,
  write: (mixed) => void
};

export type Next = (req: Req, resp: Resp) => void;
