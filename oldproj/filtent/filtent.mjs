#!/usr/bin/env node

import readline from 'node:readline';
import { stdin, stdout } from 'node:process';
import { writeFile as writeFileAsync, readFile as readFileAsync } from 'node:fs/promises';
import { existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rl = readline.createInterface({ input: stdin, output: stdout });
const _inputLines = [];
let _inputDone = false;

rl.on('line', (line) => {
  _inputLines.push(line);
  _inputDone = false;
});

rl.on('close', () => {
  _inputDone = true;
});

async function nextLine() {
  while (_inputLines.length === 0 && !_inputDone) {
    await new Promise((r) => setTimeout(r, 50));
  }
  if (_inputLines.length > 0) {
    return _inputLines.shift();
  }
  return '9'; // EOF - exit
}

const activities = [];
let cart = [];
let viewedProducts = new Set();

const access = {
  app: 'Filtent',
  allowed: true,
  scopes: ['capture:webpage', 'intent:predict', 'memory:write', 'memory:read_summary'],
  categories: ['web:commerce'],
  revoked: false,
};

const products = {
  laptops: [
    {
      id: 'X1',
      name: 'Laptop X1',
      specs: 'Intel Core i7-13700H · 16GB DDR5 RAM · 512GB NVMe SSD · 15.6" FHD 144Hz · Intel Iris Xe',
      price: 999,
      reviews: [
        '"Solid performance for everyday work and light gaming. Battery lasts about 8 hours." — Alex T.',
        '"Build quality is good but the speakers are average." — Jordan K.',
        '"Great value at this price point. The display is bright and colors are accurate." — Sam R.',
      ],
      category: 'laptop',
    },
    {
      id: 'Y2',
      name: 'Laptop Y2',
      specs: 'AMD Ryzen 7 7840U · 32GB LPDDR5 RAM · 1TB PCIe 4.0 SSD · 14" 2.8K OLED · AMD Radeon 780M',
      price: 1299,
      reviews: [
        '"Incredible screen. The OLED display makes everything look vibrant." — Morgan L.',
        '"Runs quiet even under load. Great for development work." — Casey B.',
        '"Battery life is outstanding — easily 12 hours of mixed use." — Taylor W.',
      ],
      category: 'laptop',
    },
    {
      id: 'Z3',
      name: 'Laptop Z3',
      specs: 'Intel Core i5-1340P · 8GB LPDDR5 RAM · 256GB NVMe SSD · 13.3" FHD IPS · Intel Iris Xe',
      price: 699,
      reviews: [
        '"Perfect for students. Lightweight and portable." — Riley D.',
        '"Not for heavy multitasking but handles browsing and docs smoothly." — Quinn F.',
        '"The keyboard is comfortable for long typing sessions." — Avery H.',
      ],
      category: 'laptop',
    },
  ],
  headphones: [
    {
      id: 'H1',
      name: 'Headphones H1',
      specs: 'Over-ear · Active Noise Cancellation · 30h battery · USB-C · Bluetooth 5.3',
      price: 249,
      reviews: [
        '"ANC is top-notch. Blocks out almost everything." — Jamie S.',
        '"Comfortable for long wear. Ear cups are plush." — Dana P.',
      ],
      category: 'headphone',
    },
    {
      id: 'H2',
      name: 'Headphones H2',
      specs: 'In-ear · Wireless · 8h battery · IPX5 · USB-C · Bluetooth 5.1',
      price: 79,
      reviews: [
        '"Great for workouts. Stay in place and sound good." — Reese M.',
        '"Surprisingly good sound quality for the price." — Blair C.',
      ],
      category: 'headphone',
    },
  ],
  backpacks: [
    {
      id: 'B1',
      name: 'Backpack B1',
      specs: '30L · Water-resistant · Padded laptop compartment (up to 17") · YKK zippers',
      price: 89,
      reviews: [
        '"Roomy and well-organized. Perfect for travel." — Skyler J.',
        '"The water resistance is legit. Survived a downpour." — Avery N.',
      ],
      category: 'backpack',
    },
    {
      id: 'B2',
      name: 'Backpack B2',
      specs: '20L · Lightweight (0.8 lb) · Foldable · Nylon · Sternum strap',
      price: 49,
      reviews: [
        '"Perfect daypack. Packs flat when not in use." — Casey O.',
        '"Simple and durable. No frills, just works." — Jordan M.',
      ],
      category: 'backpack',
    },
  ],
};

function getProductByName(name) {
  for (const group of Object.values(products)) {
    for (const p of group) {
      if (p.name === name) return p;
    }
  }
  return null;
}

function getCategoryForProduct(name) {
  const p = getProductByName(name);
  return p ? p.category : null;
}

function getActivityCategory(a) {
  if (a.product) {
    const cat = getCategoryForProduct(a.product);
    if (cat) return cat;
  }
  const text = ((a.label || '') + ' ' + (a.text || '')).toLowerCase();
  if (/\blaptop\b/.test(text)) return 'laptop';
  if (/\bheadphone\b/.test(text)) return 'headphone';
  if (/\bbackpack\b/.test(text)) return 'backpack';
  return 'general';
}

function now() {
  return new Date().toISOString();
}

function newId() {
  return crypto.randomUUID();
}

async function logActivity(type, label, product, text) {
  const entry = {
    id: newId(),
    app: 'Filtent',
    category: 'web:commerce',
    type,
    label,
    product: product || null,
    timestamp: now(),
    text: text || label,
  };
  activities.push(entry);
  await saveActivityLog();
}

async function saveActivityLog() {
  const filePath = path.join(__dirname, 'filtent-activity-log.json');
  await writeFileAsync(filePath, JSON.stringify(activities, null, 2), 'utf-8');
}

function saveActivityLogSync() {
  const filePath = path.join(__dirname, 'filtent-activity-log.json');
  writeFileSync(filePath, JSON.stringify(activities, null, 2), 'utf-8');
}

async function saveUIPMOutput(output) {
  const filePath = path.join(__dirname, 'filtent-uipm-output.json');
  await writeFileAsync(filePath, JSON.stringify(output, null, 2), 'utf-8');
}

async function saveMemory(memoryEntry) {
  const filePath = path.join(__dirname, 'filtent-memory.json');
  let memories = [];
  if (existsSync(filePath)) {
    try {
      const data = await readFileAsync(filePath, 'utf-8');
      memories = JSON.parse(data);
      if (!Array.isArray(memories)) memories = [];
    } catch {
      memories = [];
    }
  }
  memories.push(memoryEntry);
  await writeFileAsync(filePath, JSON.stringify(memories, null, 2), 'utf-8');
}

async function ask(question) {
  stdout.write(question);
  return await nextLine();
}

function printLine(text) {
  console.log(text);
}

function printHeader(title) {
  printLine('');
  printLine('='.repeat(56));
  printLine(`  ${title}`);
  printLine('='.repeat(56));
}

async function promptBack() {
  await ask('\nPress Enter to go back...');
}

async function showProductPage(product, sectionLabel) {
  const isRevisit = viewedProducts.has(product.name);
  if (!isRevisit) {
    viewedProducts.add(product.name);
    await logActivity('product_page_view', `Viewed ${product.name}`, product.name, `User viewed the product page for ${product.name}.`);
  } else {
    await logActivity('product_revisit', `Revisited ${product.name}`, product.name, `User revisited product page for ${product.name}.`);
  }

  while (true) {
    printHeader(`${product.name}`);
    printLine(`  Price: $${product.price}`);
    printLine(`  ${product.specs}`);
    printLine('');
    printLine('  1. View specs');
    printLine('  2. Read reviews');
    printLine('  3. Compare price');
    printLine('  4. Add to cart');
    printLine('  5. Go back');

    const choice = (await ask('\n  Select an option: ')).trim();

    if (choice === '1') {
      await logActivity('spec_view', `Viewed specs for ${product.name}`, product.name, `User viewed the specs of ${product.name}.`);
      printLine(`\n  --- ${product.name} Specs ---`);
      printLine(`  ${product.specs}`);
      await promptBack();
    } else if (choice === '2') {
      await logActivity('review_view', `Read reviews for ${product.name}`, product.name, `User read reviews for ${product.name}.`);
      printLine(`\n  --- ${product.name} Reviews ---`);
      product.reviews.forEach((r) => printLine(`  ${r}`));
      await promptBack();
    } else if (choice === '3') {
      await logActivity('price_compare', `Compared price of ${product.name}`, product.name, `User compared the price of ${product.name} ($${product.price}) against other options.`);
      printLine(`\n  --- Price Comparison ---`);
      printLine(`  ${product.name}: $${product.price}`);
      const others = products[sectionLabel]?.filter((p) => p.name !== product.name) || [];
      others.forEach((p) => printLine(`  ${p.name}: $${p.price}`));
      await promptBack();
    } else if (choice === '4') {
      await logActivity('cart_add', `Added ${product.name} to cart`, product.name, `User added ${product.name} to cart.`);
      cart.push({ product: product.name, price: product.price, addedAt: now() });
      printLine(`\n  ✓ ${product.name} added to cart.`);
      await promptBack();
    } else if (choice === '5') {
      break;
    } else {
      printLine('  Invalid option.');
    }
  }
}

async function browseSection(sectionKey, sectionTitle) {
  const items = products[sectionKey];

  while (true) {
    printHeader(sectionTitle);
    items.forEach((p, i) => {
      printLine(`  ${i + 1}. ${p.name} — $${p.price}`);
    });
    if (sectionKey === 'laptops') {
      printLine(`  ${items.length + 1}. Compare laptops`);
      printLine(`  ${items.length + 2}. Check student discounts`);
      printLine(`  ${items.length + 3}. Back`);
    } else {
      printLine(`  ${items.length + 1}. Back`);
    }

    await logActivity('category_browse', `Browsed ${sectionTitle.toLowerCase()}`, null, `User browsed ${sectionTitle.toLowerCase()}.`);

    const choice = (await ask('\n  Select an option: ')).trim();
    const num = parseInt(choice, 10);

    if (num >= 1 && num <= items.length) {
      await showProductPage(items[num - 1], sectionKey);
    } else if (sectionKey === 'laptops') {
      if (num === items.length + 1) {
        await logActivity('price_compare', 'Compared laptops', null, 'User used the compare laptops feature.');
        printLine('\n  --- Laptop Comparison ---');
        items.forEach((p) => {
          printLine(`  ${p.name}: $${p.price} — ${p.specs.split('·')[0].trim()}`);
        });
        await promptBack();
      } else if (num === items.length + 2) {
        await logActivity('student_discount_check', 'Checked student discounts for laptops', null, 'User checked student discount eligibility for laptops.');
        printLine('\n  --- Student Discounts ---');
        items.forEach((p) => {
          const discounted = Math.round(p.price * 0.85);
          printLine(`  ${p.name}: $${p.price} → $${discounted} (15% off with valid .edu email)`);
        });
        await promptBack();
      } else if (num === items.length + 3) {
        break;
      } else {
        printLine('  Invalid option.');
      }
    } else if (num === items.length + 1) {
      break;
    } else {
      printLine('  Invalid option.');
    }
  }
}

async function viewCart() {
  await logActivity('cart_view', 'Viewed cart', null, 'User viewed their cart.');
  printHeader('Your Cart');
  if (cart.length === 0) {
    printLine('  Your cart is empty.');
  } else {
    let total = 0;
    cart.forEach((item, i) => {
      printLine(`  ${i + 1}. ${item.product} — $${item.price}`);
      total += item.price;
    });
    printLine('  ' + '-'.repeat(30));
    printLine(`  Total: $${total}`);
  }
  await promptBack();
}

async function viewActivityLog() {
  printHeader('Approved Activity Log');
  if (activities.length === 0) {
    printLine('  No activities logged yet.');
  } else {
    for (const a of activities) {
      printLine(`  [${a.type}] ${a.label}${a.product ? ' (' + a.product + ')' : ''}`);
      printLine(`         ${a.timestamp}`);
      printLine('');
    }
    printLine(`  Total entries: ${activities.length}`);
  }
  await promptBack();
}

async function revokeAccess() {
  if (access.revoked) {
    printLine('\n  Access is already revoked.');
    await promptBack();
    return;
  }
  access.allowed = false;
  access.revoked = true;
  printLine('\n  Access revoked. UIPM will not run until restored.');
  await saveActivityLog();
}

async function restoreAccess() {
  if (!access.revoked) {
    printLine('\n  Access is already active.');
    await promptBack();
    return;
  }
  access.allowed = true;
  access.revoked = false;
  printLine('\n  Access restored. UIPM is active again.');
  await saveActivityLog();
}

function intentLabelForCat(cat) {
  const map = { laptop: 'a laptop', headphone: 'headphones', backpack: 'a backpack' };
  const suffix = map[cat];
  return suffix ? `Choosing ${suffix}` : 'Choosing a product';
}

function analyzeUIPM(filtentActivities) {
  if (filtentActivities.length === 0) {
    return {
      interpreted_intent: null,
      reason: 'No activity recorded yet.',
      based_on: [],
      memory: { store: false },
    };
  }

  const productVisits = {};
  const typeCounts = {};
  const categoryCounts = {};
  const typeOrder = [];

  for (const a of filtentActivities) {
    typeCounts[a.type] = (typeCounts[a.type] || 0) + 1;
    typeOrder.push(a.type);

    if (a.product) {
      productVisits[a.product] = (productVisits[a.product] || 0) + 1;
    }

    const cat = getActivityCategory(a);
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  }

  const total = filtentActivities.length;
  const focusedCats = Object.entries(categoryCounts).filter(([k]) => k !== 'general');
  const dominantCat = focusedCats.length > 0 ? focusedCats.sort((a, b) => b[1] - a[1])[0][0] : null;
  const dominantRatio = dominantCat ? (categoryCounts[dominantCat] / Math.max(total, 1)) : 0;

  const dominantProducts = Object.keys(productVisits).filter((n) => getCategoryForProduct(n) === dominantCat).length;
  const productsViewed = Object.keys(productVisits).length;
  const productsViewedTwice = Object.entries(productVisits).filter(([, c]) => c >= 2).length;

  const hasSpecView = (typeCounts['spec_view'] || 0) > 0;
  const hasReviews = (typeCounts['review_view'] || 0) > 0;
  const hasPriceCompare = (typeCounts['price_compare'] || 0) > 0;
  const hasStudentDiscount = (typeCounts['student_discount_check'] || 0) > 0;
  const hasCartAdd = (typeCounts['cart_add'] || 0) > 0;
  const hasRevisit = (typeCounts['product_revisit'] || 0) > 0;
  const hasCategoryRevisit = (typeCounts['category_browse'] || 0) >= 2;

  const researchSignals = [hasSpecView, hasReviews, hasPriceCompare, hasCategoryRevisit, dominantProducts >= 2].filter(Boolean).length;
  const decisionSignals = [hasStudentDiscount, hasCartAdd, hasRevisit].filter(Boolean).length;
  const hasMultipleDominantProducts = dominantProducts >= 2;

  const isDominantCategory = dominantCat && dominantRatio >= 0.4 && (categoryCounts[dominantCat] || 0) >= 3;
  const isMixedBrowsing = (!dominantCat || dominantRatio < 0.35) && Object.keys(categoryCounts).length >= 2;

  const sequenceScore = computeSequenceScore(typeOrder, filtentActivities);
  const confidence = computeConfidence(dominantCat, categoryCounts, total, dominantRatio, dominantProducts, productsViewedTwice, researchSignals, decisionSignals, sequenceScore);
  const basedOn = buildBasedOn(typeCounts, productVisits, filtentActivities);
  const alternatives = buildAlternatives(dominantCat, hasCartAdd, hasPriceCompare, dominantProducts, researchSignals + decisionSignals);
  const decisionStage = determineStage(hasCartAdd, hasStudentDiscount, hasRevisit, researchSignals + decisionSignals);

  const isStrong = dominantCat && decisionSignals >= 2 && researchSignals >= 3 && hasMultipleDominantProducts;
  const isMedium = dominantCat && researchSignals >= 3 && decisionSignals >= 1;

  if (total < 3 || confidence < 0.3 || (!isDominantCategory && total < 5)) {
    return buildLowEvidence(basedOn, filtentActivities);
  }

  const accessOutput = {
    category: 'web:commerce',
    raw_activity_exposed: false,
    approved_activity_count: filtentActivities.length,
  };

  const feedbackHooks = ['confirm', 'correct', 'dismiss', 'forget'];

  if (isStrong) {
    const summary = buildStrongSummary(dominantCat, typeCounts, productVisits, hasCartAdd);
    return {
      interpreted_intent: {
        label: intentLabelForCat(dominantCat),
        stage: decisionStage,
        status: 'in_progress',
        confidence,
      },
      based_on: trimBasedOn(basedOn),
      alternative_interpretations: alternatives,
      memory: {
        store: true,
        type: 'intent_memory',
        future_agent_context: true,
        summary,
      },
      access: accessOutput,
      feedback: {
        prompt_required_now: true,
        available_actions: feedbackHooks,
      },
    };
  }

  if (isMedium) {
    const summary = buildResearchSummary(dominantCat, typeCounts, productVisits);
    return {
      interpreted_intent: {
        label: `Comparing ${dominantCat}s`,
        stage: decisionStage,
        status: 'in_progress',
        confidence,
      },
      based_on: trimBasedOn(basedOn),
      alternative_interpretations: alternatives,
      memory: {
        store: confidence >= 0.5,
        type: 'intent_memory',
        future_agent_context: confidence >= 0.5,
        summary,
      },
      access: accessOutput,
      feedback: {
        prompt_required_now: confidence >= 0.5,
        available_actions: feedbackHooks,
      },
    };
  }

  if (isMixedBrowsing) {
    return buildLowEvidence(basedOn, filtentActivities);
  }

  return {
    interpreted_intent: {
      label: 'General browsing',
      stage: 'exploration',
      status: 'in_progress',
      confidence: Math.min(confidence, 0.35),
    },
    based_on: trimBasedOn(basedOn),
    alternative_interpretations: ['Exploring without a specific goal', 'Casually looking at options'],
    memory: {
      store: false,
      type: 'intent_memory',
      future_agent_context: false,
      summary: 'User is browsing with low engagement signals.',
    },
    access: accessOutput,
    feedback: {
      prompt_required_now: false,
      available_actions: [],
    },
  };
}

function computeSequenceScore(typeOrder, filtentActivities) {
  const idealSequence = ['category_browse', 'product_page_view', 'spec_view', 'review_view', 'price_compare', 'student_discount_check', 'cart_add'];
  const seqMap = { category_browse: 0, product_page_view: 1, spec_view: 2, review_view: 3, price_compare: 4, student_discount_check: 5, cart_add: 6 };
  let score = 0;
  let pairs = 0;

  for (let i = 0; i < typeOrder.length - 1; i++) {
    const a = seqMap[typeOrder[i]];
    const b = seqMap[typeOrder[i + 1]];
    if (a !== undefined && b !== undefined) {
      pairs++;
      if (a <= b) score += 1;
    }
  }

  if (pairs === 0) return 0;
  return score / pairs;
}

function computeConfidence(dominantCat, categoryCounts, total, dominantRatio, dominantProducts, productsViewedTwice, researchSignals, decisionSignals, sequenceScore) {
  if (!dominantCat) return 0.0;

  const catEvents = categoryCounts[dominantCat] || 0;

  const densityScore = Math.min(1.0, catEvents / 10) * 0.25;
  const researchScore = Math.min(researchSignals / 5, 1.0) * 0.25;
  const decisionScore = Math.min(decisionSignals / 3, 1.0) * 0.20;
  const focusScore = Math.min(productsViewedTwice * 0.06, 0.12);
  const ratioScore = Math.min(dominantRatio / 0.6, 1.0) * 0.08;
  const seqScore = sequenceScore * 0.10;

  const cats = Object.keys(categoryCounts).length;
  let ambiguityPenalty = 0;
  if (cats >= 3 && dominantRatio < 0.35) ambiguityPenalty = -0.15;
  else if (cats >= 2 && dominantRatio < 0.3) ambiguityPenalty = -0.10;
  else if (total < 5) ambiguityPenalty = -0.05;

  let confidence = densityScore + researchScore + decisionScore + focusScore + ratioScore + seqScore + ambiguityPenalty;
  confidence = Math.max(0.0, Math.min(0.82, confidence));
  return Math.round(confidence * 100) / 100;
}

function buildBasedOn(typeCounts, productVisits, activities) {
  const items = [];
  const productsSeen = Object.keys(productVisits);
  if (productsSeen.length > 0) {
    items.push('Viewed product pages');
  }
  if ((typeCounts['spec_view'] || 0) > 0) items.push('Opened product specs');
  if ((typeCounts['review_view'] || 0) > 0) items.push('Read product reviews');
  if ((typeCounts['price_compare'] || 0) > 0) items.push('Compared prices across options');
  if ((typeCounts['student_discount_check'] || 0) > 0) items.push('Checked student discount eligibility');
  if ((typeCounts['product_revisit'] || 0) > 0) items.push('Revisited a product page');
  if ((typeCounts['cart_add'] || 0) > 0) items.push('Added product to cart');
  if ((typeCounts['cart_view'] || 0) > 0) items.push('Viewed cart');
  if (items.length === 0) items.push('Minimal browsing activity');
  return items;
}

function trimBasedOn(basedOn) {
  return basedOn.slice(0, 8);
}

function buildAlternatives(dominantCat, hasCartAdd, hasPriceCompare, dominantProducts, totalSignals) {
  if (!dominantCat || totalSignals < 3) {
    return ['Uncertain browsing pattern', 'No clear intent detected'];
  }
  const alts = [`Helping someone else choose a ${dominantCat}`];
  if (dominantProducts >= 3 && !hasCartAdd) alts.push(`General ${dominantCat} research`);
  if (dominantProducts >= 2 && !hasPriceCompare) alts.push('Saving options for later');
  if (alts.length < 2) alts.push('Comparing specifications without purchase intent');
  return alts;
}

function determineStage(hasCartAdd, hasStudentDiscount, hasRevisit, totalSignals) {
  if (hasCartAdd) return 'comparison before decision';
  if (hasStudentDiscount && hasRevisit) return 'comparison before decision';
  if (totalSignals >= 4) return 'active evaluation';
  if (totalSignals >= 2) return 'research/comparison';
  return 'initial exploration';
}

function buildStrongSummary(dominantCat, typeCounts, productVisits, hasCartAdd) {
  const productCount = Object.keys(productVisits).filter((n) => getCategoryForProduct(n) === dominantCat).length;
  const prefix = `User is comparing ${productCount} ${dominantCat} model${productCount !== 1 ? 's' : ''} using product pages,`;
  const actions = [];
  if ((typeCounts['spec_view'] || 0) > 0) actions.push('specs');
  if ((typeCounts['review_view'] || 0) > 0) actions.push('reviews');
  if ((typeCounts['price_compare'] || 0) > 0) actions.push('prices');
  if ((typeCounts['student_discount_check'] || 0) > 0) actions.push('student discounts');
  if ((typeCounts['product_revisit'] || 0) > 0) actions.push('revisits');
  if (hasCartAdd) actions.push('cart activity');
  return prefix + ' ' + actions.join(', ') + '.';
}

function buildResearchSummary(dominantCat, typeCounts, productVisits) {
  const names = Object.keys(productVisits).filter((n) => getCategoryForProduct(n) === dominantCat);
  const count = names.length;
  return `User is researching ${count} ${dominantCat} model${count !== 1 ? 's' : ''} by comparing specs, reviews, and prices.`;
}

function buildLowEvidence(basedOn, filtentActivities) {
  return {
    interpreted_intent: null,
    reason: 'Not enough evidence to interpret a clear user intent.',
    based_on: basedOn.length > 0 ? basedOn : (filtentActivities.length > 0 ? ['Minimal browsing activity'] : []),
    memory: { store: false },
  };
}

async function runUIPM() {
  if (access.revoked || !access.allowed) {
    const output = {
      app: 'Filtent',
      allowed: false,
      reason: 'consent_revoked',
    };
    printLine('\n' + JSON.stringify(output, null, 2));
    await saveUIPMOutput(output);
    return;
  }

  const filtentActivities = activities.filter((a) => a.app === 'Filtent');
  const result = analyzeUIPM(filtentActivities);

  const output = {
    schema_version: 'memact.uipm.v0',
    app: 'Filtent',
    allowed: true,
    interpreted_intent: result.interpreted_intent,
    based_on: result.based_on || [],
    alternative_interpretations: result.alternative_interpretations || [],
    memory: result.memory || { store: false },
    access: result.access || { category: 'web:commerce', raw_activity_exposed: false, approved_activity_count: filtentActivities.length },
    feedback: result.feedback || { prompt_required_now: false, available_actions: [] },
  };

  await saveActivityLog();
  await saveUIPMOutput(output);

  if (result.memory && result.memory.store) {
    const memoryEntry = {
      id: newId(),
      type: 'intent_memory',
      label: result.interpreted_intent.label,
      stage: result.interpreted_intent.stage,
      status: result.interpreted_intent.status,
      confidence: result.interpreted_intent.confidence,
      summary: result.memory.summary,
      evidence: result.based_on || [],
      alternatives: result.alternative_interpretations || [],
      source_app: 'Filtent',
      category: 'web:commerce',
      created_at: now(),
    };
    await saveMemory(memoryEntry);
  }

  printLine('');
  printLine('='.repeat(56));
  printLine('  Memact UIPM Result');
  printLine('='.repeat(56));

  if (result.interpreted_intent === null) {
    printLine('  Not enough evidence to interpret a clear user intent.');
    if (result.based_on && result.based_on.length > 0) {
      printLine('');
      printLine('  Based on:');
      result.based_on.forEach((b) => printLine(`    - ${b}`));
    }
  } else {
    const intent = result.interpreted_intent;
    printLine(`  App: Filtent`);
    printLine(`  Access: allowed`);
    printLine(`  Category: web:commerce`);
    printLine(`  Interpretation: ${intent.label}`);
    printLine(`  Stage: ${intent.stage}`);
    printLine(`  Confidence: ${intent.confidence.toFixed(2)}`);
    printLine('');
    printLine('  Based on:');
    (result.based_on || []).forEach((b) => printLine(`    - ${b}`));
    printLine('');
    printLine(`  Stored as memory: ${result.memory && result.memory.store ? 'Yes' : 'No'}`);
    printLine(`  Future agent context: ${result.memory && result.memory.future_agent_context ? 'Yes' : 'No'}`);
  }
  printLine('');

  await promptBack();
}

async function main() {
  printLine('');
  printLine('  Welcome to Filtent — a simulated shopping experience.');
  printLine('  No real purchases are made. Activity may be logged for');
  printLine('  intent analysis via Memact UIPM.');
  printLine('');

  while (true) {
    printLine('='.repeat(56));
    printLine('  Filtent Store');
    printLine('='.repeat(56));
    printLine('  1. Browse laptops');
    printLine('  2. Browse headphones');
    printLine('  3. Browse backpacks');
    printLine('  4. View cart');
    printLine('  5. View approved activity log');
    printLine('  6. Run Memact UIPM');
    printLine('  7. Revoke Memact access');
    printLine('  8. Restore Memact access');
    printLine('  9. Exit');

    const choice = (await ask('\n  Select an option: ')).trim();

    switch (choice) {
      case '1':
        await browseSection('laptops', 'Laptops');
        break;
      case '2':
        await browseSection('headphones', 'Headphones');
        break;
      case '3':
        await browseSection('backpacks', 'Backpacks');
        break;
      case '4':
        await viewCart();
        break;
      case '5':
        await viewActivityLog();
        break;
      case '6':
        await runUIPM();
        break;
      case '7':
        await revokeAccess();
        break;
      case '8':
        await restoreAccess();
        break;
      case '9':
        printLine('\n  Thank you for visiting Filtent Store.');
        printLine('  Activity log and UIPM data saved to disk.\n');
        saveActivityLogSync();
        rl.close();
        process.exit(0);
      default:
        printLine('  Invalid option. Please try again.');
    }
  }
}

main().catch((err) => {
  console.error('Filtent error:', err);
  rl.close();
  process.exit(1);
});
