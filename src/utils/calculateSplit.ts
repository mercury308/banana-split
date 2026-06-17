export interface SplitInputs {
  billTotal: number;
  tipPercentage: number;
  people: number;
}

export interface SplitResult {
  billTotal: number;
  tipPercentage: number;
  tipAmount: number;
  totalWithTip: number;
  people: number;
  amountPerPerson: number;
}

export const calculateSplit = ({ billTotal, tipPercentage, people }: SplitInputs): SplitResult => {
  const safeBill = Number.isFinite(billTotal) ? billTotal : 0;
  const safeTip = Number.isFinite(tipPercentage) ? tipPercentage : 0;
  const safePeople = Math.max(1, Math.round(Number.isFinite(people) ? people : 1));

  const tipAmount = safeBill * (safeTip / 100);
  const totalWithTip = safeBill + tipAmount;

  return {
    billTotal: safeBill,
    tipPercentage: safeTip,
    tipAmount,
    totalWithTip,
    people: safePeople,
    amountPerPerson: totalWithTip / safePeople,
  };
};

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
