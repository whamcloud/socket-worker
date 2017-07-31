// @flow

//
// Copyright (c) 2017 Intel Corporation. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.

import { type MultiplexedSocketInterface } from './multiplexed-socket.js';
import { type Payload } from './route-by-data.js';

import { default as highland, type HighlandStreamT } from 'highland';

type ErrorEnum = Error | string | { [key: string]: string };

function buildResponseError(error: ErrorEnum): Error {
  if (error instanceof Error) return error;
  else if (typeof error === 'string') return new Error(error);
  else
    return Object.keys(error).reduce((err: Error, key: string) => {
      if (key !== 'message')
        // $FlowFixMe: flow does not recogize this monkey-patch
        err[key] = error[key];

      return err;
    }, new Error(error.message));
}

type ErrorResp = {
  error?: { [key: string]: string }
};

export type StreamFn<B> = Payload => HighlandStreamT<B>;

export const many = <A>(socket: MultiplexedSocketInterface): StreamFn<A> => (
  data: Payload
): HighlandStreamT<A> => {
  socket.emit('message', data);
  const s: HighlandStreamT<A & ErrorResp> = highland(
    'message',
    socket
  ).onDestroy(socket.end.bind(socket));
  return s.map((response): A => {
    const error = response.error;

    if (error) throw buildResponseError(error);

    return response;
  });
};

export const one = <A>(socket: MultiplexedSocketInterface): StreamFn<A> => (
  data: Payload
): HighlandStreamT<A> => {
  const stream: HighlandStreamT<A> = highland(push => {
    socket.emit('message', data, function ack(response: A & ErrorResp) {
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
