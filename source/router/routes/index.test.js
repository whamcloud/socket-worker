import { jasmine, describe, it, beforeEach, expect, jest } from "../../jasmine.js";

describe("router", () => {
  let index, mockWildcard;

  beforeEach(() => {
    mockWildcard = jasmine.createSpy("wildcard");

    jest.mock("./router/routes/wildcard.js", () => mockWildcard);

    index = require("./index").default;
  });

  it("should have a wildcard route", () => {
    expect(index.wildcard).toEqual(mockWildcard);
  });
});
