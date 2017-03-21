import connections from './connections.js';

import { jasmine, describe, it, beforeEach, expect } from '../../jasmine.js';

describe('connections middleware', () => {
  let req, resp, next;

  beforeEach(() => {
    req = {
      id: 1,
      connections: [],
      type: 'connect'
    };

    resp = {};

    next = jasmine.createSpy('next');
  });

  describe('with a type of "connect"', () => {
    beforeEach(() => {
      connections(req, resp, next);
    });

    it('should add the list of connections to the request', () => {
      expect(req.connections).toEqual({
        1: []
      });
    });

    it('should not call next', () => {
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('with a type not equal to "connect"', () => {
    beforeEach(() => {
      req.type = 'end';
      connections(req, resp, next);
    });

    it('should add the list of connections to the request', () => {
      expect(req.connections).toEqual({
        1: []
      });
    });

    it('should call next with the request and response', () => {
      expect(next).toHaveBeenCalledOnceWith(req, resp);
    });
  });
});
