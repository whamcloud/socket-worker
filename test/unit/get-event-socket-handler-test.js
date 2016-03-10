import proxyquire from 'proxyquire';
import {describe, beforeEach, jasmine, it, expect} from '../jasmine';

describe('get event socket handler', () => {
  var getEventSocketHandler, getEventSocket,
    eventSocket, socket, workerContext, handler, router;

  beforeEach(() => {
    eventSocket = {
      onMessage: jasmine.createSpy('onMessage'),
      sendMessage: jasmine.createSpy('sendMessage'),
      end: jasmine.createSpy('end')
    };

    router = {
      go: jasmine.createSpy('go'),
      verbs: {
        GET: 'get'
      }
    };

    getEventSocket = jasmine.createSpy('getEventSocket')
      .and.returnValue(eventSocket);

    getEventSocketHandler = proxyquire('../../source/get-event-socket-handler', {
      './get-event-socket.js': {default: getEventSocket},
      './router/index.js': {default: router}
    }).default;

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
    expect(workerContext.addEventListener)
      .toHaveBeenCalledOnceWith('message', jasmine.any(Function), false);
  });

  describe('connect', () => {
    var args;

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
      expect(getEventSocket)
        .toHaveBeenCalledOnceWith(socket, '1');
    });

    it('should not recreate an existing socket', () => {
      handler(args);

      expect(getEventSocket).toHaveBeenCalledOnce();
    });
  });

  describe('send', () => {
    var args;

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

    it('should not route a message if we haven\'t connected yet', () => {
      handler(args);

      expect(router.go).not.toHaveBeenCalled();
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
        expect(router.go).toHaveBeenCalledOnceWith('/foo/bar',
          { verb: 'get', payload: args.data.payload, isAck: undefined },
          { socket: eventSocket, write: jasmine.any(Function) }
        );
      });

      it('should send a postMessage when writing', () => {
        var write = router.go.calls.mostRecent().args[2].write;

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
    var args;

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
