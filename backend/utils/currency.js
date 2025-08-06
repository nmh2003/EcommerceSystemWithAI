/**
 * Currency utilities
 * Utility functions for currency conversion
 */

/**
 * Convert VND to USD
 * @param {number} vndAmount - Amount in VND
 * @param {number} exchangeRate - VND to USD exchange rate (default: 23000)
 * @returns {number} Amount in USD (rounded to 2 decimal places)
 */
function vndToUsd(vndAmount, exchangeRate = 23000) {
  if (typeof vndAmount !== "number" || vndAmount < 0) {
    throw new Error("Invalid VND amount");
  }

  if (typeof exchangeRate !== "number" || exchangeRate <= 0) {
    throw new Error("Invalid exchange rate");
  }

  // Convert VND to USD and round to 2 decimal places
  const usdAmount = vndAmount / exchangeRate;
  return Math.round(usdAmount * 100) / 100;
}

/**
 * Convert USD to VND
 * @param {number} usdAmount - Amount in USD
 * @param {number} exchangeRate - VND to USD exchange rate (default: 23000)
 * @returns {number} Amount in VND (rounded to nearest integer)
 */
function usdToVnd(usdAmount, exchangeRate = 23000) {
  if (typeof usdAmount !== "number" || usdAmount < 0) {
    throw new Error("Invalid USD amount");
  }

  if (typeof exchangeRate !== "number" || exchangeRate <= 0) {
    throw new Error("Invalid exchange rate");
  }

  // Convert USD to VND and round to nearest integer
  const vndAmount = usdAmount * exchangeRate;
  return Math.round(vndAmount);
}

/**
 * Get current exchange rate from environment or default
 * @returns {number} Exchange rate VND to USD
 */
function getExchangeRate() {
  const rate = process.env.VND_TO_USD_RATE;
  return rate ? parseFloat(rate) : 23000; // Default 23,000 VND = 1 USD
}

module.exports = {
  vndToUsd,
  usdToVnd,
  getExchangeRate,
};
