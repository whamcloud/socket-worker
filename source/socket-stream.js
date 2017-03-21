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

import { type MultiplexedSocketInterface } from './multiplexed-socket.js';

import { default as highland, type HighlandStreamT } from 'highland';

export type Data<A> = {
  path: string,
  method: 'get' | 'post' | 'put' | 'patch' | 'delete',
  options?: {
    qs: A,
    jsonMask?: string
  }
};

type ErrorEnum = Error | string | { [key: string]: string };

function buildResponseError(error: ErrorEnum): Error {
  if (error instanceof Error)
    return error;
  else if (typeof error === 'string')
    return new Error(error);
  else
    return Object.keys(error).reduce(
      (err: Error, key: string) => {
        if (key !== 'message')
          // $FlowFixMe: flow does not recogize this monkey-patch
          err[key] = error[key];

        return err;
      },
      new Error(error.message)
    );
}

type ErrorResp = {
  error?: { [key: string]: string }
};

type StreamFn<A, B> = (Data<A>) => HighlandStreamT<B>;

export const many = <A, B>(
  socket: MultiplexedSocketInterface
): StreamFn<A, B> =>
  (data: Data<A>): HighlandStreamT<B> => {
    socket.emit('message', data);
    const s: HighlandStreamT<B & ErrorResp> = highland(
      'message',
      socket
    ).onDestroy(socket.end.bind(socket));
    return s.map((response): B => {
      const error = response.error;

      if (error) throw buildResponseError(error);

      return response;
    });
  };

export const one = <A, B>(socket: MultiplexedSocketInterface): StreamFn<A, B> =>
  (data: Data<A>): HighlandStreamT<B> => {
    const stream: HighlandStreamT<B> = highland(push => {
      socket.emit('message', data, function ack(response: B & ErrorResp) {
        const error = response != null && response.error;

        if (error) push(buildResponseError(error));
        else push(null, response);

        if (stream.paused) stream.emit('end');

        push(null, highland.nil);
      });
    });

    stream.once('end', socket.end.bind(socket));
    stream.on('error', () => {});

    return stream;
  };
