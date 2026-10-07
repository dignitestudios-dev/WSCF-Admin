/** Dollars with thousands separators and always two decimals: $1,250.00. */
export const formatMoney = (amount: number) =>
  `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
