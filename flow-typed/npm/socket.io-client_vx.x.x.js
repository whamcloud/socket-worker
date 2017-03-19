// @flow

import { EventEmitter } from 'events';

declare module 'socket.io-client' {
  declare export interface SocketIoClient extends EventEmitter {
    disconnect(): void
  }
  declare export default (uri: string) => SocketIoClient;
}
