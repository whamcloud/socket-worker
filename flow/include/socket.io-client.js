export type socketIoClientInstanceHandler = (arg: any) => void;
export type socketIoClientInstance = {
  on(eventName: string, fn: socketIoClientInstanceHandler): void,
  off(eventName: string, fn: socketIoClientInstanceHandler): void,
  once(eventName: string, fn: socketIoClientInstanceHandler): void,
  emit(
    eventName: string,
    data: ?Object,
    ack: ?socketIoClientInstanceHandler
  ): void,
  removeAllListeners(id: string): void,
  disconnect(): void
};
