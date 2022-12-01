function roundNumber(value, decimals = 2) {
  return Number(Math.round(value + "e" + decimals) + "e-" + decimals);
}

module.exports = roundNumber;
