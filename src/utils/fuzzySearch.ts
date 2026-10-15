/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HerbalProduct } from '../types/pharmacy';

// Computes Levenshtein distance between two strings
export function levenshteinDistance(a: string, b: string): number {
  const an = a.length;
  const bn = b.length;
  if (an === 0) return bn;
  if (bn === 0) return an;

  const matrix: number[][] = [];
  for (let i = 0; i <= bn; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= an; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= bn; i++) {
    for (let j = 1; j <= an; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          )
        );
      }
    }
  }

  return matrix[bn][an];
}

// Normalizes Ayurvedic & Indian phonetic transliterations for resilient search
export function normalizeAyurvedicTerm(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[āáàâä]/g, 'a')
    .replace(/[īíìîï]/g, 'i')
    .replace(/[ūúùûü]/g, 'u')
    .replace(/[ṛṝ]/g, 'ri')
    .replace(/[śṣ]/g, 'sh')
    .replace(/[ñṅṇ]/g, 'n')
    .replace(/[ṭ]/g, 't')
    .replace(/[ḍ]/g, 'd')
    .replace(/choorna/g, 'churna')
    .replace(/ghritam/g, 'ghrita')
    .replace(/tailam/g, 'taila')
    .replace(/arishtam/g, 'arishta')
    .replace(/asavam/g, 'asava')
    .replace(/vati/g, 'bati')
    .replace(/batee/g, 'bati')
    .replace(/shilajeet/g, 'shilajit')
    .replace(/ashvagandha/g, 'ashwagandha')
    .replace(/guggul/g, 'guggulu')
    .replace(/triphla/g, 'triphala');
}

// Checks if a word fuzzy matches a target word
export function isFuzzyMatch(word: string, target: string, maxDistance = 2): boolean {
  const normWord = normalizeAyurvedicTerm(word);
  const normTarget = normalizeAyurvedicTerm(target);

  if (normTarget.includes(normWord) || normWord.includes(normTarget)) {
    return true;
  }

  if (normWord.length <= 3) {
    return normTarget.startsWith(normWord);
  }

  const distance = levenshteinDistance(normWord, normTarget);
  const allowedDistance = normWord.length > 6 ? maxDistance : 1;
  return distance <= allowedDistance;
}

export interface SearchMatchDetail {
  product: HerbalProduct;
  score: number;
  matchedFields: string[]; // e.g. ["Name", "Ashwagandha (Ingredient)", "Stress / Insomnia (Indication)"]
}

// Extract all searchable text from a product including deep monograph tabs
export function getProductSearchableText(product: HerbalProduct): {
  name: string;
  sanskritName: string;
  tagline: string;
  category: string;
  form: string;
  indications: string[];
  ingredients: string[];
  monographText: string[];
  priceStrings: string[];
} {
  const ingredients: string[] = [];
  if (Array.isArray(product.keyIngredients)) {
    product.keyIngredients.forEach((ing) => {
      if (ing.herb) ingredients.push(ing.herb);
      if (ing.botanicalName) ingredients.push(ing.botanicalName);
      if (ing.role) ingredients.push(ing.role);
    });
  }

  const monographText: string[] = [];

  // Monograph Tabs
  if (Array.isArray(product.monographTabs)) {
    product.monographTabs.forEach((tab) => {
      if (tab.title) monographText.push(tab.title);
      if (tab.subtitle) monographText.push(tab.subtitle);
      if (Array.isArray(tab.items)) {
        tab.items.forEach((item) => {
          if (item.title) monographText.push(item.title);
          if (item.text) monographText.push(item.text);
          if (item.customTag) monographText.push(item.customTag);
          if (Array.isArray(item.tags)) monographText.push(...item.tags);
          if (item.botanicalName) monographText.push(item.botanicalName);
          if (item.role) monographText.push(item.role);
        });
      }
      if (Array.isArray(tab.blocks)) {
        tab.blocks.forEach((block) => {
          if (block.type === 'header' && block.headerData?.text) {
            monographText.push(block.headerData.text);
            if (block.headerData.subtitle) monographText.push(block.headerData.subtitle);
          } else if (block.type === 'rich_text' && block.richTextData?.content) {
            monographText.push(block.richTextData.content);
            if (block.richTextData.secondaryContent) monographText.push(block.richTextData.secondaryContent);
          } else if (block.type === 'card' && block.cardData) {
            if (block.cardData.title) monographText.push(block.cardData.title);
            if (block.cardData.subtitle) monographText.push(block.cardData.subtitle);
            if (block.cardData.description) monographText.push(block.cardData.description);
            if (block.cardData.content) monographText.push(block.cardData.content);
            if (block.cardData.rowText) monographText.push(block.cardData.rowText);
            if (Array.isArray(block.cardData.elements)) {
              block.cardData.elements.forEach((el) => {
                if (el.text) monographText.push(el.text);
                if (el.horizontalText) monographText.push(el.horizontalText);
                if (el.imageCaption) monographText.push(el.imageCaption);
                if (Array.isArray(el.tags)) {
                  el.tags.forEach((t) => monographText.push(t.text));
                }
              });
            }
          } else if (block.type === 'tags' && block.tagsData?.tags) {
            block.tagsData.tags.forEach((t) => monographText.push(t.text));
            if (block.tagsData.detailedContent) monographText.push(block.tagsData.detailedContent);
          } else if (block.type === 'image_text' && block.imageTextData) {
            if (block.imageTextData.title) monographText.push(block.imageTextData.title);
            if (block.imageTextData.text) monographText.push(block.imageTextData.text);
            if (block.imageTextData.detailedContent) monographText.push(block.imageTextData.detailedContent);
          }
        });
      }
    });
  }

  // Detailed Uses
  if (product.detailedUses) {
    if (Array.isArray(product.detailedUses.primaryBenefits)) {
      monographText.push(...product.detailedUses.primaryBenefits);
    }
    if (Array.isArray(product.detailedUses.ailmentsTreated)) {
      monographText.push(...product.detailedUses.ailmentsTreated);
    }
    if (product.detailedUses.actionMechanism) {
      monographText.push(product.detailedUses.actionMechanism);
    }
    if (product.detailedUses.doshaEffect) {
      monographText.push(product.detailedUses.doshaEffect);
    }
  }

  // Dosage Guideline
  if (product.dosageAndAnupana) {
    if (product.dosageAndAnupana.standardDosage) monographText.push(product.dosageAndAnupana.standardDosage);
    if (product.dosageAndAnupana.anupanaCarrier) monographText.push(product.dosageAndAnupana.anupanaCarrier);
    if (product.dosageAndAnupana.bestTiming) monographText.push(product.dosageAndAnupana.bestTiming);
    if (product.dosageAndAnupana.duration) monographText.push(product.dosageAndAnupana.duration);
  }

  // Precautions & Contraindications & Storage
  if (Array.isArray(product.precautionsAndContraindications)) {
    monographText.push(...product.precautionsAndContraindications);
  }
  if (product.storageGuideline) {
    monographText.push(product.storageGuideline);
  }
  if (product.description) {
    monographText.push(product.description);
  }
  if (Array.isArray(product.customDetails)) {
    product.customDetails.forEach((cd) => {
      if (cd.title) monographText.push(cd.title);
      if (cd.text) monographText.push(cd.text);
      if (cd.listTitle) monographText.push(cd.listTitle);
      if (Array.isArray(cd.listItems)) cd.listItems.forEach((li) => monographText.push(li));
      if (cd.tableTitle) monographText.push(cd.tableTitle);
      if (Array.isArray(cd.tableHeaders)) cd.tableHeaders.forEach((th) => monographText.push(th));
      if (Array.isArray(cd.tableRows)) {
        cd.tableRows.forEach((r) => {
          if (Array.isArray(r)) r.forEach((cell) => monographText.push(cell));
        });
      }
    });
  }

  // Prices
  const priceStrings = [
    String(product.price),
    String(product.mrp),
    `₹${product.price}`,
    `₹${product.mrp}`,
  ];
  if (product.resellerPrice) {
    priceStrings.push(String(product.resellerPrice));
    priceStrings.push(`₹${product.resellerPrice}`);
  }

  return {
    name: product.name || '',
    sanskritName: product.sanskritName || '',
    tagline: product.tagline || '',
    category: product.category || '',
    form: product.form || '',
    indications: Array.isArray(product.keyIndications) ? product.keyIndications : [],
    ingredients,
    monographText,
    priceStrings,
  };
}

// Executes smart fuzzy search on all products
export function searchProducts(
  products: HerbalProduct[],
  rawQuery: string
): {
  matched: SearchMatchDetail[];
  suggested: HerbalProduct[];
} {
  const query = rawQuery.trim();
  if (!query) {
    return {
      matched: [],
      suggested: [...products],
    };
  }

  // Check for price range queries like "under 500", "< 300", "below 1000", "less than 400"
  let maxPriceFilter: number | null = null;
  let minPriceFilter: number | null = null;
  const underPriceMatch = query.match(/(?:under|below|less than|<)\s*₹?\s*(\d+)/i);
  if (underPriceMatch) {
    maxPriceFilter = parseFloat(underPriceMatch[1]);
  }
  const abovePriceMatch = query.match(/(?:above|over|more than|>)\s*₹?\s*(\d+)/i);
  if (abovePriceMatch) {
    minPriceFilter = parseFloat(abovePriceMatch[1]);
  }

  const queryTokens = query
    .toLowerCase()
    .replace(/[^\w\s\u0900-\u097F]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 0 && !['under', 'below', 'above', 'than', 'in', 'and', 'for', 'the'].includes(t));

  const matched: SearchMatchDetail[] = [];

  for (const product of products) {
    let score = 0;
    const matchedFields: string[] = [];

    // Filter by price query if detected
    if (maxPriceFilter !== null && product.price > maxPriceFilter) {
      continue;
    }
    if (minPriceFilter !== null && product.price < minPriceFilter) {
      continue;
    }

    const {
      name,
      sanskritName,
      tagline,
      category,
      form,
      indications,
      ingredients,
      monographText,
      priceStrings,
    } = getProductSearchableText(product);

    const normName = normalizeAyurvedicTerm(name);
    const normSanskrit = normalizeAyurvedicTerm(sanskritName);
    const normTagline = normalizeAyurvedicTerm(tagline);
    const normCategory = normalizeAyurvedicTerm(category);
    const normForm = normalizeAyurvedicTerm(form);

    const fullNormalizedQuery = normalizeAyurvedicTerm(query);

    // Exact whole-query match on Name
    if (normName === fullNormalizedQuery) {
      score += 2000;
      matchedFields.push('Exact Product Name');
    } else if (normName.startsWith(fullNormalizedQuery)) {
      score += 1200;
      matchedFields.push('Product Name');
    } else if (normName.includes(fullNormalizedQuery)) {
      score += 800;
      matchedFields.push('Product Name');
    }

    // Sanskrit / Botanical Name
    if (normSanskrit.includes(fullNormalizedQuery)) {
      score += 600;
      matchedFields.push(`Classical Name (${sanskritName})`);
    }

    // Price query string match (e.g. "250")
    if (priceStrings.some((p) => p.includes(query))) {
      score += 450;
      matchedFields.push(`Price ₹${product.price}`);
    }

    // Category / Form
    if (normCategory.includes(fullNormalizedQuery) || normForm.includes(fullNormalizedQuery)) {
      score += 350;
      matchedFields.push(`Form / Category (${product.form || product.category})`);
    }

    // Evaluate token-by-token
    for (const token of queryTokens) {
      const normToken = normalizeAyurvedicTerm(token);
      let tokenMatched = false;

      // 1. Name match or fuzzy match
      if (isFuzzyMatch(normToken, normName)) {
        score += 300;
        tokenMatched = true;
        if (!matchedFields.includes('Product Name')) matchedFields.push('Product Name');
      }

      // 2. Sanskrit match
      if (isFuzzyMatch(normToken, normSanskrit)) {
        score += 250;
        tokenMatched = true;
        if (!matchedFields.some((f) => f.includes('Classical Name'))) {
          matchedFields.push(`Classical: ${sanskritName}`);
        }
      }

      // 3. Ingredients match
      for (const ing of ingredients) {
        if (isFuzzyMatch(normToken, ing)) {
          score += 200;
          tokenMatched = true;
          if (!matchedFields.some((f) => f.includes(ing))) {
            matchedFields.push(`Herb: ${ing}`);
          }
          break;
        }
      }

      // 4. Indications match
      for (const ind of indications) {
        if (isFuzzyMatch(normToken, ind)) {
          score += 180;
          tokenMatched = true;
          if (!matchedFields.some((f) => f.includes(ind))) {
            matchedFields.push(`Indication: ${ind}`);
          }
          break;
        }
      }

      // 5. Monograph Tabs & Detailed Clinical Text
      for (const text of monographText) {
        if (isFuzzyMatch(normToken, text)) {
          score += 100;
          tokenMatched = true;
          const snippet = text.length > 40 ? `${text.slice(0, 40)}...` : text;
          if (!matchedFields.some((f) => f.includes('Monograph'))) {
            matchedFields.push(`Monograph: "${snippet}"`);
          }
          break;
        }
      }

      // 6. Tagline
      if (normTagline.includes(normToken)) {
        score += 120;
        tokenMatched = true;
      }
    }

    if (score > 0 || (maxPriceFilter !== null && queryTokens.length === 0)) {
      // Add bonus for rating & review count for high quality results
      score += (product.rating || 4.5) * 10;
      if (product.sortBadge === 'trending' || product.sortBadge === 'top_seller') {
        score += 50;
      }
      matched.push({
        product,
        score,
        matchedFields: matchedFields.slice(0, 3), // Keep top 3 most informative highlights
      });
    }
  }

  // Sort matched products descending by score
  matched.sort((a, b) => b.score - a.score);

  const matchedIds = new Set(matched.map((m) => m.product.id));

  // Suggested products: Remaining products not in matched list, sorted by rating, deals, and popularity
  const suggested = products
    .filter((p) => !matchedIds.has(p.id))
    .sort((a, b) => {
      // Boost top sellers & trending
      const aPriority = a.sortBadge === 'top_seller' ? 2 : a.sortBadge === 'trending' ? 1 : 0;
      const bPriority = b.sortBadge === 'top_seller' ? 2 : b.sortBadge === 'trending' ? 1 : 0;
      if (aPriority !== bPriority) return bPriority - aPriority;
      return (b.rating * b.reviewsCount) - (a.rating * a.reviewsCount);
    });

  return { matched, suggested };
}

// Shuffles an array randomly (Fisher-Yates)
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
