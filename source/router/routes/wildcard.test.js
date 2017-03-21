import {
  jasmine,
  describe,
  it,
  beforeEach,
  expect,
  jest
} from '../../jasmine.js';

describe('routes wildcard', () => {
  let mockRouter, wildcard;

  beforeEach(() => {
    mockRouter = {
      all: jasmine.createSpy('all')
    };

    jest.mock('./router/index.js', () => mockRouter);

    wildcard = require('./wildcard.js').default;

    wildcard();
  });

  it('should call router.all', () => {
    expect(mockRouter.all).toHaveBeenCalledOnceWith(
      '/(.*)',
      jasmine.any(Function)
    );
  });

  describe('generic handler', () => {
    let req, resp, next, getMany$, getOne$;

    beforeEach(() => {
      getMany$ = {
        each: jasmine.createSpy('each')
      };

      getOne$ = {
        each: jasmine.createSpy('each')
      };

      req = {
        isAck: true,
        payload: {
          foo: 'bar'
        },
        getMany$: jasmine.createSpy('getMany$').and.returnValue(getMany$),
        getOne$: jasmine.createSpy('getOne$').and.returnValue(getOne$)
      };

      resp = {
        write: 'write'
      };

      next = jasmine.createSpy('next');
    });

    describe('with ack', () => {
      beforeEach(() => {
        mockRouter.all.calls.mostRecent().args[1](req, resp, next);
      });

      it('should call getOne$', () => {
        expect(req.getOne$).toHaveBeenCalledOnceWith(req.payload);
      });

      it('should call each', () => {
        expect(getOne$.each).toHaveBeenCalledOnceWith(resp.write);
      });

      it('should call next', () => {
        expect(next).toHaveBeenCalledOnceWith(req, resp);
      });
    });

    describe('with no ack', () => {
      beforeEach(() => {
        req.isAck = false;
        mockRouter.all.calls.mostRecent().args[1](req, resp, next);
      });

      it('should call getMany$', () => {
        expect(req.getMany$).toHaveBeenCalledOnceWith(req.payload);
      });

      it('should call each', () => {
        expect(getMany$.each).toHaveBeenCalledOnceWith('write');
      });

      it('should call next', () => {
        expect(next).toHaveBeenCalledOnceWith(req, resp);
      });
    });
  });
});
