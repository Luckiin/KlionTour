export const DEFAULT_GAS_PRICE_PER_KM = 7.5;

export const MIN_DAILY_RATE = 1000;

export function calculateTransportQuote(distanceKm, tripType, gasPricePerKm = DEFAULT_GAS_PRICE_PER_KM) {
  const baseDistance = Number(distanceKm) || 0;

  if (tripType === "ida_volta") {
    const chargedDistance = baseDistance * 2;
    const calculatedPrice = chargedDistance * gasPricePerKm;

    return {
      gasPricePerKm,
      chargedDistance,
      price: Math.max(calculatedPrice, MIN_DAILY_RATE),
      hasMinimumDailyRate: calculatedPrice < MIN_DAILY_RATE,
    };
  }

  if (tripType === "in" || tripType === "out") {
    return {
      gasPricePerKm,
      chargedDistance: baseDistance,
      price: baseDistance * gasPricePerKm,
      hasMinimumDailyRate: false,
    };
  }

  return {
    gasPricePerKm,
    chargedDistance: 0,
    price: 0,
    hasMinimumDailyRate: false,
  };
}
