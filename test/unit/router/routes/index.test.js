describe('router', () => {
  let index, mockWildcard;

  beforeEach(() => {
    mockWildcard = jasmine.createSpy('wildcard');

    jest.mock(
      '../../../../source/router/routes/wildcard.js',
      () => mockWildcard
    );

    index = require('../../../../source/router/routes/index').default;
  });

  it('should have a wildcard route', () => {
    expect(index.wildcard).toEqual(mockWildcard);
  });
});
