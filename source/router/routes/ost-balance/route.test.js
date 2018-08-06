import highland from "highland";

import { jest, jasmine, describe, it, beforeEach, expect } from "../../../jasmine.js";

import fixtures from "./ost-balance.test.fixture.json";

describe("get OST balance stream", () => {
  let getOne$, targetStream, mockRouter, ostMetricsStream, handler, write;

  beforeEach(() => {
    getOne$ = jasmine.createSpy("getOne$").and.callFake(({ path }) => {
      if (path === "/target/metric") return (ostMetricsStream = highland());
      else if (path === "/target") return (targetStream = highland());
    });

    write = jasmine.createSpy("write");

    mockRouter = {
      get: jasmine.createSpy("get")
    };
    jest.mock("./router/index.js", () => mockRouter);

    require("./route.js").default();

    handler = mockRouter.get.calls.mostRecent().args[1];
  });

  describe("fetching metrics", () => {
    describe("fetching gte 0 percent", () => {
      beforeEach(() => {
        handler(
          {
            getOne$,
            payload: {
              options: {
                method: "get",
                percentage: 0,
                qs: {
                  filesystem_id: "1"
                }
              }
            }
          },
          { write },
          () => {}
        );

        ostMetricsStream.write(fixtures[0].in);
        ostMetricsStream.end();

        targetStream.write({ objects: [] });
        targetStream.end();
      });

      it("should request data with overrides", () => {
        expect(getOne$).toHaveBeenCalledOnceWith({
          path: "/target/metric",
          options: {
            method: "get",
            qs: {
              kind: "OST",
              metrics: "kbytestotal,kbytesfree",
              latest: true,
              filesystem_id: "1"
            }
          }
        });
      });

      it("should return computed data", () => {
        expect(write).toHaveBeenCalledOnceWith(fixtures[0].out);
      });
    });

    describe("fetching with filtered data", () => {
      beforeEach(() => {
        handler(
          {
            getOne$,
            payload: {
              options: {
                method: "get",
                percentage: 1
              }
            }
          },
          { write },
          () => {}
        );

        ostMetricsStream.write(fixtures[0].in);
        ostMetricsStream.end();

        targetStream.write({
          objects: []
        });
        targetStream.end();
      });

      it("should return computed data", () => {
        const out = fixtures[0].out.map(x => ({
          ...x,
          values: [x.values[0]]
        }));

        expect(write).toHaveBeenCalledWith(out);
      });
    });

    describe("fetching with matching targets", () => {
      beforeEach(() => {
        handler(
          {
            getOne$,
            payload: {
              options: {
                method: "get",
                percentage: 0
              }
            }
          },
          { write },
          () => {}
        );

        ostMetricsStream.write(fixtures[0].in);
        ostMetricsStream.end();

        targetStream.write({
          objects: [
            {
              id: "18",
              name: "OST001"
            },
            {
              id: "19",
              name: "OST002"
            }
          ]
        });
        targetStream.end();
      });

      it("should request data without overrides", () => {
        expect(getOne$).toHaveBeenCalledOnceWith({
          path: "/target/metric",
          options: {
            method: "get",
            qs: {
              kind: "OST",
              metrics: "kbytestotal,kbytesfree",
              latest: true
            }
          }
        });
      });

      it("should return computed data", () => {
        const f = fixtures[0].out.map(x => ({
          ...x,
          values: x.values.map(v => ({
            ...v,
            x: v.x === "18" ? "OST001" : "OST002"
          }))
        }));

        expect(write).toHaveBeenCalledOnceWith(f);
      });
    });
  });
});
