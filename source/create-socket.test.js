import { jasmine, describe, it, beforeEach, expect, jest } from './jasmine.js';

const getEventHandler = (methodName, socket) => event => {
  const args = socket[methodName].calls.allArgs();

  return args.filter(item => item[0] === event)[0][1];
};

describe('create socket', () => {
  let result,
    socket,
    mockIO,
    url,
    workerContext,
    getOnceHandler,
    getOnHandler,
    createSocket;

  beforeEach(() => {
    socket = {
      on: jasmine.createSpy('on'),
      once: jasmine.createSpy('once'),
      disconnect: jasmine.createSpy('disconnect')
    };

    mockIO = jasmine.createSpy('io').and.returnValue(socket);

    jest.mock('socket.io-client/lib/index.js', () => mockIO);

    createSocket = require('./create-socket.js').default;

    url = 'https://localhost:8000';
    workerContext = {
      postMessage: jasmine.createSpy('postMessage')
    };

    getOnceHandler = getEventHandler('once', socket);
    getOnHandler = getEventHandler('on', socket);

    result = createSocket(url, workerContext);
  });

  it('should be a function', () => {
    expect(createSocket).toEqual(jasmine.any(Function));
  });

  it('should return a socket', () => {
    expect(result).toBe(socket);
  });

  it('should register a reconnecting handler', () => {
    expect(socket.on).toHaveBeenCalledOnceWith(
      'reconnecting',
      jasmine.any(Function)
    );
  });

  it('should post a message on reconnecting', () => {
    const handler = getOnHandler('reconnecting');
    handler(2);

    expect(workerContext.postMessage).toHaveBeenCalledOnceWith({
      type: 'reconnecting',
      data: 2
    });
  });

  it('should register a reconnect handler', () => {
    expect(socket.on).toHaveBeenCalledOnceWith(
      'reconnect',
      jasmine.any(Function)
    );
  });

  it('should post a message on reconnect', () => {
    const handler = getOnHandler('reconnect');
    handler(3);

    expect(workerContext.postMessage).toHaveBeenCalledOnceWith({
      type: 'reconnect',
      data: 3
    });
  });

  it('should register an error handler', () => {
    expect(socket.once).toHaveBeenCalledOnceWith(
      'error',
      jasmine.any(Function)
    );
  });

  it('should post a message on error', () => {
    const err = new Error('boom!');

    const handler = getOnceHandler('error');
    handler(err);

    expect(workerContext.postMessage).toHaveBeenCalledOnceWith({
      type: 'error',
      data: err
    });
  });

  it('should disconnect on error', () => {
    const err = new Error('boom!');

    const handler = getOnceHandler('error');
    handler(err);

    expect(socket.disconnect).toHaveBeenCalledOnce();
  });

  it('should post a message on disconnect', () => {
    const handler = getOnceHandler('disconnect');
    handler();

    expect(workerContext.postMessage).toHaveBeenCalledOnceWith({
      type: 'disconnect'
    });
  });
});
