export const parseReceiptLines = (rawLines = []) => {
  const ignoredPatterns = /^(subtotal|tax|total|tip|change|cash|card|balance|thank you|receipt|gratuity|service charge|discount)$/i;

  const parsedItems = rawLines
    .map((line) => String(line ?? '').replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .map((line) => {
      const priceMatch = line.match(/\$?\s*(\d+\.\d{2})/);
      if (!priceMatch) {
        return null;
      }

      const price = Number(priceMatch[1]);
      if (!Number.isFinite(price) || price <= 0) {
        return null;
      }

      const priceToken = priceMatch[0].replace(/[^\d.]/g, '');
      const normalizedLine = line.replace(/\$\s*/g, '$');

      const endPriceMatch = normalizedLine.match(/^(.*?)(?:\s+|)(\$?\d+\.\d{2})\s*$/);
      const startPriceMatch = normalizedLine.match(/^(\$?\d+\.\d{2})\s+(.*)$/);
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
