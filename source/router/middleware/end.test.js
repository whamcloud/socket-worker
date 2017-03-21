import end from './end.js';

import { jasmine, describe, it, beforeEach, expect } from '../../jasmine.js';

describe('end middleware', () => {
  let req, resp, next, endSpy;

  beforeEach(() => {
    endSpy = jasmine.createSpy('end');
    req = {
      id: '1',
      connections: {
        '1': [
          {
            end: endSpy
          }
        ]
      },
      type: 'end'
    };

    resp = {};

    next = jasmine.createSpy('next');
  });

  describe('with a type of "end"', () => {
    beforeEach(() => {
      end(req, resp, next);
    });

    it('should invoke end on the connection', () => {
      expect(endSpy).toHaveBeenCalledOnce();
    });

    it('should remove the connection from the list', () => {
      expect(req.connections['1']).toBe(undefined);
    });

    it('should not call next', () => {
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('with a type not equal to "end"', () => {
    beforeEach(() => {
      req.type = 'connect';
      end(req, resp, next);
    });

    it('should call next with the request and response', () => {
      expect(next).toHaveBeenCalledOnceWith(req, resp);
    });

    it('should not call end on the matching connection list', () => {
      expect(req.connections['1'][0].end).not.toHaveBeenCalled();
    });

    it('should not delete the connection from the list', () => {
      expect(req.connections['1']).not.toBe(undefined);
    });
  });

  describe('when the connection does not exist', () => {
    beforeEach(() => {
      delete req.connections[req.id];
      end(req, resp, next);
    });

    it('should call next with the request and response', () => {
      expect(next).toHaveBeenCalledOnceWith(req, resp);
    });
  });
});
