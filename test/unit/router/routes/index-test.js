import proxyquire from '../../../proxyquire.js';
import {describe, beforeEach, jasmine, it, expect} from '../../../jasmine.js';

describe('router', () => {
  var index, wildcard;

  beforeEach(() => {
    wildcard = jasmine.createSpy('wildcard');

    index = proxyquire('../source/router/routes/index', {
      './wildcard.js': wildcard
    }).default;
  });

  it('should have a wildcard route', () => {
    expect(index.wildcard).toEqual(wildcard);
  });
});
