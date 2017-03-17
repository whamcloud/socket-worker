describe('get event socket handler', () => {
  let getEventSocketHandler,
    mockGetEventSocket,
    eventSocket,
    socket,
    workerContext,
    handler,
    mockRouter;

  beforeEach(() => {
    eventSocket = {
      onMessage: jasmine.createSpy('onMessage'),
      sendMessage: jasmine.createSpy('sendMessage'),
      end: jasmine.createSpy('end')
    };

    mockRouter = {
      go: jasmine.createSpy('go'),
      verbs: {
        GET: 'get'
      }
    };

    mockGetEventSocket = jasmine
      .createSpy('getEventSocket')
      .and.returnValue(eventSocket);

    jest.mock('../../source/get-event-socket.js', () => mockGetEventSocket);
    jest.mock('../../source/router/index.js', () => mockRouter);

    getEventSocketHandler = require('../../source/get-event-socket-handler').default;

    socket = {};

    workerContext = {
      addEventListener: jasmine.createSpy('addEventListener'),
      postMessage: jasmine.createSpy('postMessage')
    };

    getEventSocketHandler(socket, workerContext);

    handler = workerContext.addEventListener.calls.allArgs()[0][1];
  });

  it('should be a factory function', () => {
    expect(getEventSocketHandler).toEqual(jasmine.any(Function));
  });

  it('should add a message listener', () => {
    expect(workerContext.addEventListener).toHaveBeenCalledOnceWith(
      'message',
      jasmine.any(Function),
      false
    );
  });

  describe('connect', () => {
    let args;

    beforeEach(() => {
      args = {
        data: {
          id: '1',
          type: 'connect'
        }
      };

      handler(args);
    });

    it('should get an event socket', () => {
      expect(mockGetEventSocket).toHaveBeenCalledOnceWith(socket, '1');
    });

    it('should not recreate an existing socket', () => {
      handler(args);

      expect(mockGetEventSocket).toHaveBeenCalledOnce();
    });
  });

  describe('send', () => {
    let args;

    beforeEach(() => {
      args = {
        data: {
          path: '/foo/bar',
          id: '1',
          payload: { path: '/foo/bar' },
          type: 'send'
        }
      };
    });

    it('should not route a message if we have not connected yet', () => {
      handler(args);

      expect(mockRouter.go).not.toHaveBeenCalled();
    });

    describe('with a connected socket', () => {
      beforeEach(() => {
        handler({
          data: {
            id: '1',
            type: 'connect'
          }
        });

        handler(args);
      });

      it('should route the data', () => {
        expect(mockRouter.go).toHaveBeenCalledOnceWith(
          '/foo/bar',
          { verb: 'get', payload: args.data.payload, isAck: undefined },
          { socket: eventSocket, write: jasmine.any(Function) }
        );
      });

      it('should send a postMessage when writing', () => {
        const write = mockRouter.go.calls.mostRecent().args[2].write;

        write('foo');

        expect(workerContext.postMessage).toHaveBeenCalledOnceWith({
          type: 'message',
          id: '1',
          payload: 'foo'
        });
      });
    });
  });

  describe('end', () => {
    let args;

    beforeEach(() => {
      args = {
        data: {
          id: '1',
          type: 'end'
        }
      };
    });

    it('should not end a non-existent socket', () => {
      handler(args);

      expect(eventSocket.end).not.toHaveBeenCalled();
    });

    describe('with a connected socket', () => {
      beforeEach(() => {
        handler({
          data: {
            id: '1',
            type: 'connect'
          }
        });

        handler(args);
      });

      it('should end a connected socket', () => {
        expect(eventSocket.end).toHaveBeenCalledOnce();
      });

      it('should not end a socket twice', () => {
        handler(args);

        expect(eventSocket.end).toHaveBeenCalledOnce();
      });
    });
  });
});
