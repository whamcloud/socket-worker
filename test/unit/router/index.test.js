describe('router', () => {
  var mockGetRouter, router, r;

  beforeEach(() => {
    router = {
      router: true
    };

    mockGetRouter = jasmine.createSpy('router').and.returnValue(router);

    jest.mock('intel-router', () => mockGetRouter);

    r = require('../../../source/router/index.js').default;
  });

  it('should instantiate the router', () => {
    expect(mockGetRouter).toHaveBeenCalledOnce();
  });

  it('should export the router', () => {
    expect(r).toBe(router);
  });
});
