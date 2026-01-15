const VND_TO_USD_RATE = import.meta.env.VITE_VND_TO_USD_RATE || 23000;

export function vndToUsd(vndAmount) {
  if (typeof vndAmount !== "number" || vndAmount < 0) {
    throw new Error("Invalid VND amount");
  }

  return vndAmount / VND_TO_USD_RATE;
}

export function usdToVnd(usdAmount) {
  if (typeof usdAmount !== "number" || usdAmount < 0) {
    throw new Error("Invalid USD amount");
  }

  return usdAmount * VND_TO_USD_RATE;
}

export function getExchangeRate() {
  return VND_TO_USD_RATE;
}
