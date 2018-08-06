import end from "./end.js";

import { jasmine, describe, it, beforeEach, expect } from "../../jasmine.js";

describe("end middleware", () => {
  let req, resp, next, endSpy, destroySpy;

  beforeEach(() => {
    endSpy = jasmine.createSpy("end");
    destroySpy = jasmine.createSpy("destroy");

    req = {
      id: "1",
      connections: {
        "1": [
          {
            end: endSpy
          },
          {
            destroy: destroySpy
          }
        ]
      },
      type: "end"
    };

    resp = {};

    next = jasmine.createSpy("next");
  });

  describe('with a type of "end"', () => {
    beforeEach(() => {
      end(req, resp, next);
    });

    it("should invoke end on the connection", () => {
      expect(endSpy).toHaveBeenCalledOnce();
    });

    it("should destroy all associated streams", () => {
      expect(destroySpy).toHaveBeenCalledOnce();
    });

    it("should remove the connection and the stream from the list", () => {
      expect(req.connections["1"]).toBe(undefined);
    });

    it("should not call next", () => {
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('with a type not equal to "end"', () => {
    beforeEach(() => {
      req.type = "connect";
      end(req, resp, next);
    });

    it("should call next with the request and response", () => {
      expect(next).toHaveBeenCalledOnceWith(req, resp);
    });

    it("should not call end on the matching connection list", () => {
      expect(endSpy).not.toHaveBeenCalled();
    });

    it("should not call destroy on the matching streams", () => {
      expect(destroySpy).not.toHaveBeenCalled();
    });

    it("should not delete the connection from the list", () => {
      expect(req.connections["1"]).not.toBe(undefined);
    });
  });

  describe("when the connection does not exist", () => {
    beforeEach(() => {
      delete req.connections[req.id];
      end(req, resp, next);
    });

    it("should call next with the request and response", () => {
      expect(next).toHaveBeenCalledOnceWith(req, resp);
    });
  });
});
