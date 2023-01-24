/**
 * Returns the income tax computed for the given salary in accordance with
 * the latest Ethiopian tax law which outlines a categorical tax rate and deduction amount.
 *
 * @param {number} salary The salary amount based on which income tax is to be computed
 * @returns {number} The computed income tax
 */
function computeIncomeTax(salary) {
  let result = 0;
  var tax = {};
  // salary = Math.floor(Math.random()*50+10000)
  // console.log(salary,"j");
  if (salary <= 600) {
    tax = { taxRate: 0, deduction: 0 };
  } else if (salary >= 601 && salary <= 1650) {
    tax = { taxRate: 0.1, deduction: 60 };
  } else if (salary >= 1651 && salary <= 3200) {
    tax = { taxRate: 0.15, deduction: 142.5 };
  } else if (salary >= 3201 && salary <= 5250) {
    tax = { taxRate: 0.2, deduction: 302.5 };
  } else if (salary >= 5251 && salary <= 7800) {
    tax = { taxRate: 0.25, deduction: 565 };
  } else if (salary >= 7801 && salary <= 10900) {
    tax = { taxRate: 0.3, deduction: 955 };
  } else {
    tax = { taxRate: 0.35, deduction: 1500 };
  }
  // console.log(salary,tax)
  result = salary * tax.taxRate - tax.deduction;
  console.log("[computeIncomeTax]: Line 27 -> Tax amount: ", result);
  return { taxAmount: result, ...tax };
}

module.exports = computeIncomeTax;
