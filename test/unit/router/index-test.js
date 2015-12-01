'use strict';

import proxyquire from 'proxyquire';

describe('router', () => {
  var getRouter, router, r;

  beforeEach(() => {
    router = {
      router: true
    };

    getRouter = jasmine.createSpy('router')
      .and.returnValue(router);

    r = proxyquire.noPreserveCache()('../../../router/index', {
      'intel-router': getRouter
    }).default;
  });

  it('should instantiate the router', () => {
    expect(getRouter).toHaveBeenCalledOnce();
  });

  it('should export the router', () => {
    expect(r).toBe(router);
  });
});
