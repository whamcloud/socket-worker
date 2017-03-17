describe('routes wildcard', () => {
  let mockRouter, wildcard;

  beforeEach(() => {
    mockRouter = {
      all: jasmine.createSpy('all')
    };

    jest.mock('../../../../source/router/index.js', () => mockRouter);

    wildcard = require('../../../../source/router/routes/wildcard.js').default;

    wildcard();
  });

  it('should call router.all', () => {
    expect(mockRouter.all).toHaveBeenCalledOnceWith(
      '/(.*)',
      jasmine.any(Function)
    );
  });

  describe('generic handler', () => {
    let req, resp, next;

    beforeEach(() => {
      req = {
        isAck: true,
        payload: {
          foo: 'bar'
        }
      };

      resp = {
        write: 'write',
        socket: {
          sendMessage: jasmine.createSpy('resp.socket.sendMessage'),
          onMessage: jasmine.createSpy('resp.socket.onMessage')
        }
      };

      next = jasmine.createSpy('next');
    });

    describe('with ack', () => {
      beforeEach(() => {
        mockRouter.all.calls.mostRecent().args[1](req, resp, next);
      });

      it('should send a message when the data contains an ack', () => {
        expect(resp.socket.sendMessage).toHaveBeenCalledOnceWith(
          req.payload,
          resp.write
        );
      });

      it('should not call onMessage', () => {
        expect(resp.socket.onMessage).not.toHaveBeenCalled();
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

      it('should call onMessage', () => {
        expect(resp.socket.onMessage).toHaveBeenCalledOnceWith(resp.write);
      });

      it('should call send message', () => {
        expect(resp.socket.sendMessage).toHaveBeenCalledOnceWith(
          req.payload,
          undefined
        );
      });

      it('should call next', () => {
        expect(next).toHaveBeenCalledOnceWith(req, resp);
      });
    });
  });
});
