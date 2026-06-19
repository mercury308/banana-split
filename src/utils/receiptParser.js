export const parseReceiptLines = (rawLines = []) => {
  const ignoredPatterns = /^(subtotal|tax|total|tip|change|cash|card|balance|thank you|receipt|gratuity|service charge|discount)$/i;
  const pricePattern = /\$?\d{1,3}(?:[.,]\d{1,2})?/;

  const parsedItems = rawLines
    .map((line) => String(line ?? '').replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .map((line) => {
      const normalizedLine = line.replace(/\$\s*/g, '$');
      const endPriceMatch = normalizedLine.match(
        /^(.*?)(?:\s+|)(\$?\d{1,3}(?:[.,]\d{1,2})?)\s*$/
      );
      const startPriceMatch = normalizedLine.match(
        /^(\$?\d{1,3}(?:[.,]\d{1,2})?)\s+(.*)$/
      );
      const priceMatch =
        (endPriceMatch && endPriceMatch[2]) ||
        (startPriceMatch && startPriceMatch[1]) ||
        normalizedLine.match(pricePattern)?.[0];

      if (!priceMatch) {
        return null;
      }

      const price = Number(
        priceMatch.replace(/,/g, '.').replace(/\$/g, '')
      );
      if (!Number.isFinite(price) || price <= 0) {
        return null;
      }

      const priceToken = priceMatch.replace(/[^\d.,]/g, '');
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

      return {
        id: cleanedName
          .toLowerCase()
          .replace(/[^a-z0-9]+/gi, '-')
          .replace(/^-|-$/g, ''),
        name: cleanedName,
        price,
        selectedBy: [],
      };
    })
    .filter(Boolean);

  return parsedItems;
};
