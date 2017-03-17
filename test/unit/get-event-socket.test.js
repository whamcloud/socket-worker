import getEventSocket from '../../source/get-event-socket';

describe('event connection', () => {
  let eventSocket, socket, id;

  beforeEach(() => {
    socket = {
      emit: jasmine.createSpy('emit'),
      on: jasmine.createSpy('on'),
      off: jasmine.createSpy('off'),
      once: jasmine.createSpy('once'),
      removeAllListeners: jasmine.createSpy('removeAllListeners')
    };

    id = 'foo';

    eventSocket = getEventSocket(socket, id);
  });

  it('should be a function', () => {
    expect(getEventSocket).toEqual(jasmine.any(Function));
  });

  it('should return an Object extending socket', () => {
    expect(Object.getPrototypeOf(eventSocket)).toBe(socket);
  });

  it('should return a socket with a sendMessage method', () => {
    eventSocket.sendMessage({});

    expect(socket.emit).toHaveBeenCalledOnceWith('messagefoo', {}, undefined);
  });

  it('should take an ack for sendMessage', () => {
    const spy = jasmine.createSpy('spy');

    eventSocket.sendMessage({}, spy);

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
      eventSocket.sendMessage({ path: '/host' });

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
      eventSocket.end();
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

  it('should register an onMessage handler', () => {
    const spy = jasmine.createSpy('spy');

    eventSocket.onMessage(spy);

    expect(socket.on).toHaveBeenCalledOnceWith('messagefoo', spy);
  });
});
