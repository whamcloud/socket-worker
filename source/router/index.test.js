import {
  jasmine,
  describe,
  it,
  beforeEach,
  expect,
  jest
} from '../../jasmine.js';

describe('router', () => {
  let mockGetRouter, router, r;

  beforeEach(() => {
    router = {
      router: true
    };

    mockGetRouter = jasmine.createSpy('router').and.returnValue(router);

    jest.mock('@iml/router', () => mockGetRouter);

    r = require('./index.js').default;
  });

  it('should instantiate the router', () => {
    expect(mockGetRouter).toHaveBeenCalledOnce();
  });

  it('should export the router', () => {
    expect(r).toBe(router);
  });
});
