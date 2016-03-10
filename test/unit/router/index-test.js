import proxyquire from '../../proxyquire.js';
import {describe, beforeEach, jasmine, it, expect} from '../../jasmine.js';

describe('router', () => {
  var getRouter, router, r;

  beforeEach(() => {
    router = {
      router: true
    };

    getRouter = jasmine.createSpy('router')
      .and.returnValue(router);

    r = proxyquire('../source/router/index.js', {
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
