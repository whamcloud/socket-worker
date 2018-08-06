import highland from "highland";

import { jest, jasmine, describe, it, beforeEach, expect } from "../../../jasmine.js";

describe("readWriteHeatMap", () => {
  let mockStreams, getDurationStream, getRangeStream, duration$, range$, mockRouter, req, onGet, resp, next;

  beforeEach(() => {
    getDurationStream = jasmine.createSpy("getDurationStream").and.returnValue(duration$);

    getRangeStream = jasmine.createSpy("getRangeStream").and.returnValue(range$);

    mockStreams = {
      getDurationStream,
      getRangeStream
    };

    mockRouter = {
      get: jasmine.createSpy("get")
    };

    jest.mock("./router/routes/read-write-heat-map/streams.js", () => mockStreams);
    jest.mock("./router/index.js", () => mockRouter);

    require("./route.js").default();

    onGet = mockRouter.get.calls.argsFor(0)[1];

    resp = {
      write: jasmine.createSpy("write")
    };

    next = jasmine.createSpy("next");
  });

  it("should call router.get", () => {
    expect(mockRouter.get).toHaveBeenCalledOnceWith("/read-write-heat-map", jasmine.any(Function));
  });

  describe("duration stream", () => {
    beforeEach(() => {
      req = {
        payload: {
          options: {
            qs: { foo: "bar", metrics: "stats_read_bytes" },
            durationParams: {
              size: 10,
              unit: "minutes"
            },
            timeOffset: -275
          }
        }
      };
      duration$ = highland();
      getDurationStream.and.returnValue(duration$);
      onGet(req, resp, next);
      duration$.write({ foo: "bar" });
      duration$.destroy();
    });

    it("should call getDurationStream", () => {
      expect(mockStreams.getDurationStream).toHaveBeenCalledOnceWith(
        req,
        { foo: "bar", metrics: "stats_read_bytes" },
        -275,
        {
          size: 10,
          unit: "minutes"
        }
      );
    });

    it("should write the response", () => {
      expect(resp.write).toHaveBeenCalledOnceWith({ foo: "bar" });
    });

    it("should call next", () => {
      expect(next).toHaveBeenCalledOnceWith(req, resp);
    });
  });

  describe("range stream", () => {
    beforeEach(() => {
      req = {
        payload: {
          options: {
            qs: { bar: "baz", metrics: "stats_read_iops" },
            rangeParams: {
              startDate: "2017-01-01T00:15:00.000Z",
              endDate: "2017-01-02T05:17:00.000Z"
            },
            timeOffset: -230
          }
        }
      };
      range$ = highland();
      getRangeStream.and.returnValue(range$);
      onGet(req, resp, next);
      range$.write({ bar: "baz" });
      range$.destroy();
    });

    it("should call getDurationStream", () => {
      expect(mockStreams.getRangeStream).toHaveBeenCalledOnceWith(
        req,
        { bar: "baz", metrics: "stats_read_iops" },
        -230,
        {
          startDate: "2017-01-01T00:15:00.000Z",
          endDate: "2017-01-02T05:17:00.000Z"
        }
      );
    });

    it("should write the response", () => {
      expect(resp.write).toHaveBeenCalledOnceWith({ bar: "baz" });
    });

    it("should call next", () => {
      expect(next).toHaveBeenCalledOnceWith(req, resp);
    });
  });
});
