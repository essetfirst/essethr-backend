/**
 * Returns to hours extracted from date time milliseconds number
 *
 */
function computeHours(datetime = 0) {
  return Math.ceil(datetime / 360000);
}

module.exports = computeHours;
