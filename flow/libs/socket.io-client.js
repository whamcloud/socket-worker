// @flow

import type {socketIoClientInstance} from '../include/socket.io-client.js';

declare module 'socket.io-client/socket.io.js' {
  declare var exports: (uri: string, opts: ?Object) => socketIoClientInstance;
}
