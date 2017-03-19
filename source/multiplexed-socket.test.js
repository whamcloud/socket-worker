import { jest, jasmine, describe, it, beforeEach, expect } from './jasmine.js';

describe('multiplexed socket', () => {
  let multiplexedSocket, socket;

  beforeEach(() => {
    socket = {
      emit: jasmine.createSpy('emit'),
      on: jasmine.createSpy('on'),
      off: jasmine.createSpy('off'),
      once: jasmine.createSpy('once'),
      removeAllListeners: jasmine.createSpy('removeAllListeners')
    };

    jest.mock('./get-random-value.js', () => () => 'foo');

    const getmultiplexedSocket = require('./multiplexed-socket').default;
    multiplexedSocket = getmultiplexedSocket(socket);
  });

  it('should return a socket with a emit method', () => {
    multiplexedSocket.emit('message', {});

    expect(socket.emit).toHaveBeenCalledOnceWith('messagefoo', {}, undefined);
  });

  it('should take an ack for emit', () => {
    const spy = jasmine.createSpy('spy');

    multiplexedSocket.emit('message', {}, spy);

    expect(socket.emit).toHaveBeenCalledOnceWith('messagefoo', {}, spy);
  });

  it('should register a reconnect listener on socket', () => {
    expect(socket.on).toHaveBeenCalledOnceWith(
      'reconnect',
      jasmine.any(Function)
    );
  });

  describe('reconnecting', () => {
    let handler;

    beforeEach(() => {
      handler = socket.on.calls.mostRecent().args[1];
    });

    it('should re-call emit on reconnect', () => {
      multiplexedSocket.emit('message', { path: '/host' });

      handler();

      expect(socket.emit).toHaveBeenCalledTwiceWith(
        'messagefoo',
        {
          path: '/host'
        },
        undefined
      );
    });
  });

  describe('ending', () => {
    beforeEach(() => {
      multiplexedSocket.end();
    });

    it('should remove message listeners on end', () => {
      expect(socket.removeAllListeners).toHaveBeenCalledOnceWith('messagefoo');
    });

    it('should return a socket with an end method', () => {
      expect(socket.emit).toHaveBeenCalledOnceWith('endfoo');
    });

    it('should remove reconnect listener on disconnect', () => {
      expect(socket.off).toHaveBeenCalledOnceWith(
        'reconnect',
        jasmine.any(Function)
      );
    });
  });

  describe('disconnecting', () => {
    beforeEach(() => {
      const handler = socket.once.calls.mostRecent().args[1];
      handler();
    });

    it('should register a listener', () => {
      expect(socket.once).toHaveBeenCalledOnceWith(
        'destroy',
        jasmine.any(Function)
      );
    });

    it('should remove message listeners on destroy', () => {
      expect(socket.removeAllListeners).toHaveBeenCalledOnceWith('messagefoo');
    });

    it('should remove reconnect listener on destroy', () => {
      expect(socket.off).toHaveBeenCalledOnceWith(
        'reconnect',
        jasmine.any(Function)
      );
    });
  });

  it('should have an on handler', () => {
    const spy = jasmine.createSpy('spy');

    multiplexedSocket.on('message', spy);

    expect(socket.on).toHaveBeenCalledOnceWith('messagefoo', spy);
  });
});
