import {
  jasmine,
  describe,
  it,
  beforeEach,
  expect,
  jest
} from '../../jasmine.js';
import highland from 'highland';

describe('socket factory middleware', () => {
  let req,
    resp,
    next,
    eventSocket,
    mockSocketStream,
    mockMultiplexedSocket,
    socketFactory,
    socket,
    one$,
    many$;

  beforeEach(() => {
    one$ = highland();
    many$ = highland();

    mockSocketStream = {
      one: jasmine.createSpy('one').and.returnValue(one$),
      many: jasmine.createSpy('many').and.returnValue(() => many$)
    };

    eventSocket = {
      onMessage: jasmine.createSpy('onMessage'),
      sendMessage: jasmine.createSpy('sendMessage'),
      end: jasmine.createSpy('end')
    };

    mockMultiplexedSocket = jasmine
      .createSpy('getEventSocket')
      .and.returnValue(eventSocket);

    socket = {};

    jest.mock('./socket-stream.js', () => mockSocketStream);
    jest.mock('./multiplexed-socket.js', () => mockMultiplexedSocket);

    socketFactory = require('./socket-factory').default;

    req = {
      id: '1',
      connections: {
        '1': []
      }
    };
    resp = {
      socket
    };
    next = jasmine.createSpy('next');
  });

  describe('initialization', () => {
    beforeEach(() => {
      socketFactory(req, resp, next);
    });

    it('should add a "getOne$" method on the request', () => {
      expect(req.getOne$).toEqual(jasmine.any(Function));
    });

    it('should add a "getMany$" method on the request', () => {
      expect(req.getMany$).toEqual(jasmine.any(Function));
    });

    it('should call next with the request and response', () => {
      expect(next).toHaveBeenCalledOnceWith(req, resp);
    });
  });

  describe('getOne$', () => {
    let s;
    beforeEach(() => {
      socketFactory(req, resp, next);
      s = req.getOne$();
    });

    it('should call getMultiplexedSocket', () => {
      expect(mockMultiplexedSocket).toHaveBeenCalledOnceWith(socket);
    });

    it('should push the socket into the connections list', () => {
      expect(req.connections['1'][0]).toEqual(eventSocket);
    });

    it('should call "one" with the socket', () => {
      expect(mockSocketStream.one).toHaveBeenCalledOnceWith(eventSocket);
    });

    it('should return one stream', () => {
      expect(s).toBe(one$);
    });
  });

  describe('getMany$', () => {
    let fn;
    beforeEach(() => {
      socketFactory(req, resp, next);
      fn = req.getMany$();
    });

    it('should call getMultiplexedSocket', () => {
      expect(mockMultiplexedSocket).toHaveBeenCalledOnceWith(socket);
    });

    it('should push the socket into the connections list', () => {
      expect(req.connections['1'][0]).toEqual(eventSocket);
    });

    it('should call "many" with the socket', () => {
      expect(mockSocketStream.many).toHaveBeenCalledOnceWith(eventSocket);
    });

    it('should return a function to stream', () => {
      expect(fn({})).toEqual(many$);
    });
  });
});
