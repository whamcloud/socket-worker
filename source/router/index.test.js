import {
  jasmine,
  describe,
  it,
  beforeEach,
  expect,
  jest
} from '../../jasmine.js';

describe('router', () => {
  let mockGetRouter, mockConnections, mockSocketFactory, mockEnd, router, r;

  beforeEach(() => {
    router = {
      addStart: jasmine.createSpy('addStart')
    };
    router.addStart.and.returnValue(router);

    mockConnections = {};
    mockSocketFactory = {};
    mockEnd = {};
    mockGetRouter = jasmine.createSpy('router').and.returnValue(router);

    jest.mock('@iml/router', () => mockGetRouter);
    jest.mock(
      './source/router/middleware/connections.js',
      () => mockConnections
    );
    jest.mock(
      './source/router/middleware/socket-factory.js',
      () => mockSocketFactory
    );
    jest.mock('./source/router/middleware/end.js', () => mockEnd);

    r = require('./index.js').default;
  });

  it('should instantiate the router', () => {
    expect(mockGetRouter).toHaveBeenCalledOnce();
  });

  it('should export the router', () => {
    expect(r).toBe(router);
  });

  it('Should add the connections middleware', () => {
    expect(router.addStart).toHaveBeenCalledWith(mockConnections);
  });

  it('Should add the socketFactory middleware', () => {
    expect(router.addStart).toHaveBeenCalledWith(mockSocketFactory);
  });

  it('Should add the end middleware', () => {
    expect(router.addStart).toHaveBeenCalledWith(mockEnd);
  });
});
