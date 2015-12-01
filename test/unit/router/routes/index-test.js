import proxyquire from 'proxyquire';

describe('router', () => {
  var index, wildcard;

  beforeEach(() => {
    wildcard = jasmine.createSpy('wildcard');

    index = proxyquire.noPreserveCache()('../../../../router/routes/index', {
      './wildcard': {default: wildcard}
    }).default;
  });

  it('should have a wildcard route', () => {
    expect(index.wildcard).toEqual(wildcard);
  });
});
