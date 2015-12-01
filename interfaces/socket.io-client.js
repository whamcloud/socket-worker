// @flow

declare var socketIoClientInstanceHandler: (arg: any) => void;
declare var socketIoClientInstance: {
  on(eventName:string, fn:socketIoClientInstanceHandler): void;
  off(eventName:string, fn:socketIoClientInstanceHandler): void;
  once(eventName:string, fn:socketIoClientInstanceHandler): void;
  emit(eventName:string, data:?Object, ack:?socketIoClientInstanceHandler): void;
  removeAllListeners(id: string): void;
  disconnect(): void;
};

declare module 'socket.io-client' {
  declare var exports: (uri: string, opts: ?Object) => socketIoClientInstance;
}
