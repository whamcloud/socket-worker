import proxyquire from '../../../proxyquire.js';
import {describe, beforeEach, jasmine, it, expect} from '../../../jasmine.js';

describe('routes wildcard', () => {
  var router, wildcard;

  beforeEach(() => {
    router = {
      all: jasmine.createSpy('all')
    };

    wildcard = proxyquire('../source/router/routes/wildcard.js', {
      '../index.js': router
    }).default;

    wildcard();
  });

  it('should call router.all', () => {
    expect(router.all)
      .toHaveBeenCalledOnceWith('/(.*)', jasmine.any(Function));
  });

  describe('generic handler', () => {
    var req, resp, next;

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
        router.all.calls.mostRecent().args[1](req, resp, next);
      });

      it('should send a message when the data contains an ack', () => {
        expect(resp.socket.sendMessage).toHaveBeenCalledOnceWith(req.payload, resp.write);
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
        router.all.calls.mostRecent().args[1](req, resp, next);
      });

      it('should call onMessage', () => {
        expect(resp.socket.onMessage).toHaveBeenCalledOnceWith(resp.write);
      });

      it('should call send message', () => {
        expect(resp.socket.sendMessage).toHaveBeenCalledOnceWith(req.payload, undefined);
      });

      it('should call next', () => {
        expect(next).toHaveBeenCalledOnceWith(req, resp);
      });
    });
  });
});
