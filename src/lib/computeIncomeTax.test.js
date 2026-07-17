const computeIncomeTax = require("./computeIncomeTax");

describe("computeIncomeTax (Ethiopian brackets)", () => {
  it("returns zero tax for salary <= 600", () => {
    expect(computeIncomeTax(600)).toMatchObject({ taxAmount: 0, taxRate: 0 });
    expect(computeIncomeTax(400).taxAmount).toBe(0);
  });

  it("applies 10% bracket with 60 deduction (601–1650)", () => {
    expect(computeIncomeTax(1000)).toMatchObject({ taxRate: 0.1, deduction: 60 });
    expect(computeIncomeTax(1000).taxAmount).toBeCloseTo(40, 5);
  });

  it("applies 15% bracket (1651–3200)", () => {
    expect(computeIncomeTax(2000)).toMatchObject({ taxRate: 0.15, deduction: 142.5 });
    expect(computeIncomeTax(2000).taxAmount).toBeCloseTo(157.5, 5);
  });

  it("applies top 35% bracket above 10900", () => {
    expect(computeIncomeTax(15000)).toMatchObject({ taxRate: 0.35, deduction: 1500 });
    expect(computeIncomeTax(15000).taxAmount).toBeCloseTo(3750, 5);
  });
});
