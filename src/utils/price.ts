export const formatPrice = (value: number): { amount: number; decimals: number } => {
  const amount = Number(value.toFixed(2));
  const decimals = Number((amount % 1).toFixed(2).split(".")[1]);
  return { amount, decimals };
};
