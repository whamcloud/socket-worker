import { jasmine, describe, it, beforeEach, expect, jest } from './jasmine.js';

describe('route by data', () => {
  let routeByData, mockRouter, mockWrite, write, self, route, socket;

  beforeEach(() => {
    mockRouter = {
      go: jasmine.createSpy('go')
    };
    write = {};
    mockWrite = jasmine.createSpy('write').and.returnValue(write);

    jest.mock('./router/index.js', () => mockRouter);
    jest.mock('./write-message.js', () => mockWrite);

    routeByData = require('./route-by-data').default;

    self = {};
    socket = {};
    route = routeByData(self, socket);

    route({
      data: {
        payload: {
          path: '/path',
          options: {
            method: 'get'
          }
        },
        id: 1,
        ack: true,
        type: 'connect'
      }
    });
  });

  it('should call router.go', () => {
    expect(mockRouter.go).toHaveBeenCalledOnceWith(
      '/path',
      {
        verb: 'get',
        payload: {
          path: '/path',
          options: {
            method: 'get'
          }
        },
        id: 1,
        type: 'connect',
        isAck: true
      },
      {
        socket,
        write
      }
    );
  });

  it('should call write', () => {
    expect(mockWrite).toHaveBeenCalledOnceWith(self, 1, {
      path: '/path',
      options: {
        method: 'get'
      }
    });
  });
});
