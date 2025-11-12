export const formatCurrency = (
  value: string,
  currency: string,
  locale: string = "en-US"
): string => {
  const number = parseFloat(value);

  if (isNaN(number)) {
    throw new Error("Invalid number");
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(number);
};
