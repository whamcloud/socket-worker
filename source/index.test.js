import {
  jasmine,
  describe,
  it,
  beforeEach,
  afterEach,
  expect,
  jest
} from './jasmine.js';

describe('socker worker', () => {
  let mockCreateSocket,
    mockRoutes,
    mockRouteByData,
    routeFn,
    addEventListener,
    socket;

  beforeEach(() => {
    socket = {};
    mockCreateSocket = jasmine
      .createSpy('createSocket')
      .and.returnValue(socket);
    mockRoutes = {
      ostBalance: jasmine.createSpy('ostBalance'),
      wildcard: jasmine.createSpy('wildcard')
    };
    routeFn = jasmine.createSpy('routeFn');
    mockRouteByData = jasmine.createSpy('routeByData').and.returnValue(routeFn);

    jest.mock('./create-socket.js', () => mockCreateSocket);
    jest.mock('./router/routes/index.js', () => mockRoutes);
    jest.mock('./route-by-data.js', () => mockRouteByData);

    addEventListener = self.addEventListener;
    self.addEventListener = jasmine.createSpy('addEventListener');

    require('./index').default;
  });

  afterEach(() => {
    self.addEventListener = addEventListener;
  });

  it('should invoke the ostBalance route', () => {
    expect(mockRoutes.ostBalance).toHaveBeenCalledOnce();
  });

  it('should invoke the wildcard route', () => {
    expect(mockRoutes.wildcard).toHaveBeenCalledOnce();
  });

  it('should create a socket', () => {
    expect(mockCreateSocket).toHaveBeenCalledOnceWith(
      self.location.origin,
      self
    );
  });

  it('should listen for messages', () => {
    expect(self.addEventListener).toHaveBeenCalledOnceWith(
      'message',
      routeFn,
      false
    );
  });

  it('should call routebyData', () => {
    expect(mockRouteByData).toHaveBeenCalledOnceWith(self, socket);
  });
});
