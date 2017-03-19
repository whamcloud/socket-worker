// @flow

import { EventEmitter } from 'events';

declare module 'socket.io-client' {
  declare export class SocketIoClientInstance extends EventEmitter {
    disconnect(): void
  }
  declare export default (uri: string) => SocketIoClientInstance;
}
