export const currencyFormatter = (value: any, options: any = {}) => {
  const defaultOptions = {
    significantDigits: 2,
    thousandsSeparator: ",",
    decimalSeparator: ".",
    symbol: "₦",
    currency: "NGN",
  };

  if (typeof value !== "number") value = 0.0;
  options = { ...defaultOptions, ...options };

  switch (options.currency) {
    case "NGN":
    case "₦":
      options.symbol = "₦";
      break;
    case "USD":
      options.symbol = "$";
      break;
    default:
      options.symbol = options.symbol || "₦";
      break;
  }

  value = value.toFixed(options.significantDigits);

  const [currency, decimal] = value.split(".");
  return `${options.symbol} ${currency.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    options.thousandsSeparator
  )}${options.decimalSeparator}${decimal}`;
};
