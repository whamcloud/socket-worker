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
    let req,
      resp,
      next,
      push,
      getMany$,
      getOne$,
      getManyErrors,
      getOneErrors,
      onError;

    beforeEach(() => {
      push = jasmine.createSpy('push');

      getMany$ = {
        each: jasmine.createSpy('each')
      };

      getOne$ = {
        each: jasmine.createSpy('each')
      };

      getOneErrors = {
        errors: jasmine.createSpy('errors').and.returnValue(getOne$)
      };

      getManyErrors = {
        errors: jasmine.createSpy('errors').and.returnValue(getMany$)
      };

      req = {
        isAck: true,
        payload: {
          foo: 'bar'
        },
        getMany$: jasmine.createSpy('getMany$').and.returnValue(getManyErrors),
        getOne$: jasmine.createSpy('getOne$').and.returnValue(getOneErrors)
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

      it('should call errors', () => {
        expect(getOneErrors.errors).toHaveBeenCalledOnceWith(
          jasmine.any(Function)
        );
      });

      it('should call each', () => {
        expect(getOne$.each).toHaveBeenCalledOnceWith(resp.write);
      });

      it('should call next', () => {
        expect(next).toHaveBeenCalledOnceWith(req, resp);
      });

      describe('when error occurrs', () => {
        beforeEach(() => {
          onError = getOneErrors.errors.calls.argsFor(0)[0];
        });

        it('should serialize errors', () => {
          onError(
            {
              statusCode: 400,
              message: 'error message',
              name: 'big bad error',
              stack: 'stack trace',
              signal: 'fast ball',
              code: 400
            },
            push
          );

          expect(push).toHaveBeenCalledOnceWith(null, {
            error: {
              statusCode: 400,
              message: 'error message',
              name: 'big bad error',
              stack: 'stack trace',
              signal: 'fast ball',
              code: 400
            }
          });
        });
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

      it('should call errors', () => {
        expect(getManyErrors.errors).toHaveBeenCalledOnceWith(
          jasmine.any(Function)
        );
      });

      it('should call each', () => {
        expect(getMany$.each).toHaveBeenCalledOnceWith('write');
      });

      it('should call next', () => {
        expect(next).toHaveBeenCalledOnceWith(req, resp);
      });

      describe('when error occurrs', () => {
        beforeEach(() => {
          onError = getManyErrors.errors.calls.argsFor(0)[0];
        });

        it('should serialize errors', () => {
          onError(
            {
              statusCode: 400,
              message: 'error message',
              name: 'big bad error',
              stack: 'stack trace',
              signal: 'fast ball',
              code: 400
            },
            push
          );

          expect(push).toHaveBeenCalledOnceWith(null, {
            error: {
              statusCode: 400,
              message: 'error message',
              name: 'big bad error',
              stack: 'stack trace',
              signal: 'fast ball',
              code: 400
            }
          });
        });
      });
    });
  });
});
