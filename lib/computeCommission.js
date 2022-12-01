/**
 * Returns employee commission based on each date he/she is available
 * computed by multiplying the sales count of that day by the commission rate.
 * @param {Number} commissionRate The rate for each sales count
 * @param {Object} paidDates The dates an employee is eligible for commission
 * @param {Object} salesByDate A map of date to sales count
 * @returns {Number} the commission amount
 */
function computeCommission(commissionRate, paidDates, salesByDate) {
  return Object.keys(paidDates)
    .map((d) => (salesByDate[d] ? salesByDate[d].count * commissionRate : 0))
    .reduce((s, n) => s + n, 0);
}

module.exports = computeCommission;
