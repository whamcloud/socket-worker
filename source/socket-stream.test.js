// @flow

import highland from "highland";
import { one, many } from "./socket-stream.js";
import { jasmine, describe, it, beforeEach, expect } from "./jasmine.js";

describe("socket stream", () => {
  let spy, socket;

  beforeEach(() => {
    socket = {
      end: jasmine.createSpy("end"),
      emit: jasmine.createSpy("emit"),
      on: jasmine.createSpy("on"),
      onDestroy: jasmine.createSpy("onDestroy"),
      onReconnect: jasmine.createSpy("onReconnect")
    };

    spy = jasmine.createSpy("spy");
  });

  describe("one", () => {
    let s;

    beforeEach(() => {
      s = one(socket)({ path: "/foo" });
    });

    it("should be a function", () => {
      expect(one).toEqual(jasmine.any(Function));
    });

    it("should return a stream", () => {
      const s = one(socket)({ path: "/foo" });

      expect(highland.isStream(s)).toBe(true);
    });

    it("should send data to the socket", () => {
      s.each(() => {});
      expect(socket.emit).toHaveBeenCalledOnceWith(
        "message",
        {
          path: "/foo"
        },
        jasmine.any(Function)
      );
    });

    it("should end after a response", () => {
      s.each(() => {});

      const one = socket.emit.calls.mostRecent().args[2];

      one({});

      expect(socket.end).toHaveBeenCalledOnce();
    });

    it("should end after an error", () => {
      s.each(() => {});

      const one = socket.emit.calls.mostRecent().args[2];

      one({ error: "boom!" });

      expect(socket.end).toHaveBeenCalledOnce();
    });

    it("should end if stream is paused", () => {
      s.pull(() => {});

      const one = socket.emit.calls.mostRecent().args[2];

      one({
        error: "boom!"
      });

      expect(socket.end).toHaveBeenCalledOnce();
    });

    it("should handle errors", () => {
      s.errors(x => spy(x)).each(() => {});

      const one = socket.emit.calls.mostRecent().args[2];

      one({ error: "boom!" });

      expect(spy).toHaveBeenCalledOnceWith(new Error("boom!"));
    });

    it("should handle the response", () => {
      s.each(spy);

      const one = socket.emit.calls.mostRecent().args[2];

      one({ foo: "bar" });

      expect(spy).toHaveBeenCalledOnceWith({ foo: "bar" });
    });

    describe("stream", () => {
      let s, handler;

      beforeEach(() => {
        s = many(socket)({
          path: "/host",
          options: {
            method: "get",
            qs: { foo: "bar" }
          }
        });

        handler = socket.on.calls.mostRecent().args[1];
      });

      it("should send data to the socket", () => {
        expect(socket.emit).toHaveBeenCalledOnceWith("message", {
          path: "/host",
          options: {
            method: "get",
            qs: { foo: "bar" }
          }
        });
      });

      it("should end on destroy", () => {
        s.destroy();

        expect(socket.end).toHaveBeenCalledOnce();
      });

      it("should handle errors", () => {
        handler({
          error: new Error("boom!")
        });

        s.errors(x => spy(x)).each(() => {});

        expect(spy).toHaveBeenCalledOnceWith(new Error("boom!"));
      });

      it("should handle responses", () => {
        handler({ foo: "bar" });

        s.each(spy);

        expect(spy).toHaveBeenCalledOnceWith({ foo: "bar" });
      });
    });
  });
});
