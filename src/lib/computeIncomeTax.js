/**
 * Returns the income tax computed for the given salary in accordance with
 * the latest Ethiopian tax law which outlines a categorical tax rate and deduction amount.
 *
 * @param {number} salary The salary amount based on which income tax is to be computed
 * @returns {number} The computed income tax
 */
function computeIncomeTax(salary = 0) {
  let result = 0;
  let tax = {};
  if (salary <= 600) {
    tax = { taxRate: 0, deduction: 0 };
  } else if (salary >= 601 && salary <= 1650) {
    return { taxRate: 0.1, deduction: 60 };
  } else if (salary >= 1651 && salary <= 3200) {
    return { taxRate: 0.15, deduction: 142.5 };
  } else if (salary >= 3201 && salary <= 5250) {
    return { taxRate: 0.2, deduction: 302.5 };
  } else if (salary >= 5251 && salary <= 7800) {
    return { taxRate: 0.25, deduction: 565 };
  } else if (salary >= 7801 && salary <= 10900) {
    return { taxRate: 0.3, deduction: 955 };
  } else {
    return { taxRate: 0.35, deduction: 1500 };
  }
  result = salary * tax.taxRate - tax.deduction;
  console.log("[computeIncomeTax]: Line 27 -> Tax amount: ", result);
  return { taxAmount: result, ...tax };
}

module.exports = computeIncomeTax;
