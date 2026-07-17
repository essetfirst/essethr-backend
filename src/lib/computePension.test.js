const computePension = require("./computePension");

describe("computePension", () => {
  it("returns 70% of salary", () => {
    expect(computePension(10000)).toBe(7000);
    expect(computePension(0)).toBe(0);
  });
});
