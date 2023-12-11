export const roundValue = (value: any, decimals: number) => {
  const num = typeof value === "number" ? value : parseFloat(value);

  if (isNaN(num)) {
    return value;
  }

  const factor = Math.pow(10, decimals);
  const rounded = Math.round((num + Number.EPSILON) * factor) / factor;

  return String(rounded);
};
