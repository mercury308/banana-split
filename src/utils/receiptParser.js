const ignoredPatterns = /^(subtotal|tax|total|tip|change|cash|card|balance|thank you|receipt|gratuity|service charge|discount|amount due|visa|mastercard|debit|credit)$/i;
const amountPattern = /\$?\d{1,4}(?:[.,]\d{2})/g;

const normalizeAmount = (value) => {
  const numeric = Number(String(value).replace(/\$/g, '').replace(/,/g, '.'));
  return Number.isFinite(numeric) ? numeric : null;
};

const normalizeLines = (rawLines = []) =>
  rawLines
    .map((line) => String(line ?? '').replace(/\s+/g, ' ').trim())
    .filter(Boolean);

const parseReceiptItem = (line, index) => {
  const normalizedLine = line.replace(/\$\s*/g, '$');
  const endPriceMatch = normalizedLine.match(
    /^(.*?)(?:\s+|)(\$?\d{1,4}(?:[.,]\d{2}))\s*$/
  );
  const startPriceMatch = normalizedLine.match(
    /^(\$?\d{1,4}(?:[.,]\d{2}))\s+(.*)$/
  );

  const priceToken =
    (endPriceMatch && endPriceMatch[2]) ||
    (startPriceMatch && startPriceMatch[1]) ||
    normalizedLine.match(amountPattern)?.[0];

  if (!priceToken) {
    return null;
  }

  const price = normalizeAmount(priceToken);
  if (!price || price <= 0) {
    return null;
  }

  const nameCandidate =
    (endPriceMatch && endPriceMatch[1]?.trim()) ||
    (startPriceMatch && startPriceMatch[2]?.trim()) ||
    normalizedLine.replace(priceToken, '').replace(/\s{2,}/g, ' ').trim();

  const cleanedName = nameCandidate
    .replace(/^\d+\s*[xX]\s*/, '')
    .replace(/^[••\-*]+\s*/, '')
    .replace(/\s+\d+(?:\s*[xX]\s*\d+)?$/i, '')
    .replace(/[\s:;]+$/, '')
    .trim();

  if (!cleanedName || ignoredPatterns.test(cleanedName.toLowerCase())) {
    return null;
  }

  const safeIdBase = cleanedName
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '') || `item-${index + 1}`;

  return {
    id: `${safeIdBase}-${index}`,
    name: cleanedName,
    price,
    selectedBy: [],
  };
};

export const parseReceiptDetails = (rawLines = []) => {
  const lines = normalizeLines(rawLines);
  let subtotal = null;
  let tax = null;
  let total = null;

  lines.forEach((line) => {
    const amounts = line.match(amountPattern) || [];
    if (!amounts.length) {
      return;
    }

    const lastAmount = normalizeAmount(amounts[amounts.length - 1]);
    if (!lastAmount) {
      return;
    }

    const lower = line.toLowerCase();
    if (/\bsubtotal\b/.test(lower)) {
      subtotal = lastAmount;
      return;
    }

    if (/\btax\b/.test(lower)) {
      tax = lastAmount;
      return;
    }

    if (/\btotal\b/.test(lower) && !/\bsubtotal\b/.test(lower)) {
      total = lastAmount;
    }
  });

  const items = lines
    .map((line, index) => parseReceiptItem(line, index))
    .filter(Boolean);

  return {
    items,
    summary: {
      subtotal,
      tax,
      total,
    },
  };
};

export const parseReceiptLines = (rawLines = []) => parseReceiptDetails(rawLines).items;
