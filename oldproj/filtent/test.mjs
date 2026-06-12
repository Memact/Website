import { spawn } from 'node:child_process';
import { readFile, unlink, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILTENT = path.join(__dirname, 'filtent.mjs');

function getProductCategory(productName) {
  const map = {
    'Laptop X1': 'laptop',
    'Laptop Y2': 'laptop',
    'Laptop Z3': 'laptop',
    'Headphones H1': 'headphone',
    'Headphones H2': 'headphone',
    'Backpack B1': 'backpack',
    'Backpack B2': 'backpack',
  };
  return map[productName] || 'general';
}

async function fileExists(p) {
  try { await access(p); return true; } catch { return false; }
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function runWithInput(inputLines) {
  const input = inputLines.join('\n');
  const p = spawn('node', [FILTENT], { cwd: __dirname, stdio: ['pipe', 'pipe', 'pipe'] });

  let stdout = '';
  let stderr = '';

  p.stdout.on('data', (d) => { stdout += d.toString(); });
  p.stderr.on('data', (d) => { stderr += d.toString(); });

  await delay(200);
  // Write all input, then end stdin to signal EOF
  p.stdin.write(input);
  p.stdin.end();

  // Wait for child to exit
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      p.kill();
      resolve({ code: null, stdout, stderr, timedOut: true });
    }, 15000);

    p.on('close', (code) => {
      clearTimeout(timer);
      resolve({ code, stdout, stderr, timedOut: false });
    });
  });
}

async function cleanupFiles() {
  const files = [
    'filtent-activity-log.json',
    'filtent-uipm-output.json',
    'filtent-memory.json',
  ];
  for (const f of files) {
    const p = path.join(__dirname, f);
    if (await fileExists(p)) await unlink(p);
  }
}

let passed = 0;
let failed = 0;

function check(condition, msg) {
  if (condition) {
    console.log('  ✓ PASS:', msg);
    passed++;
    return true;
  }
  console.error('  ✗ FAIL:', msg);
  failed++;
  process.exitCode = 1;
  return false;
}

function contains(text, substr) {
  return text.includes(substr);
}

async function readJSON(filename) {
  const p = path.join(__dirname, filename);
  if (!(await fileExists(p))) return null;
  return JSON.parse(await readFile(p, 'utf-8'));
}

async function main() {
  console.log('Filtent Test Suite');
  console.log('='.repeat(50));
  console.log('');

  // -------------------------------------------------------
  // SCENARIO 1: Low-signal browsing
  // -------------------------------------------------------
  console.log('Scenario 1: Low-signal browsing (view one product, no follow-up)');
  await cleanupFiles();

  let result = await runWithInput([
    '2',      // Browse headphones
    '1',      // Headphones H1
    '1',      // View specs
    '',       // continue from specs
    '5',      // Go back from product
    '3',      // Back from section
    '6',      // Run UIPM
    '',       // continue from UIPM result
    '9',      // Exit
  ]);

  check(result.code === 0, 'Exit code 0');
  check(!result.timedOut, 'No timeout');
  check(contains(result.stdout, 'Not enough evidence to interpret a clear user intent.'), 'UIPM says low evidence');

  let log = await readJSON('filtent-activity-log.json');
  check(log !== null, 'Activity log file created');
  check(Array.isArray(log) && log.length > 0, 'Activities logged');

  let uipm = await readJSON('filtent-uipm-output.json');
  check(uipm !== null, 'UIPM output file created');
  check(uipm.interpreted_intent === null, 'interpreted_intent is null');
  check(uipm.allowed === true, 'allowed is true');
  check(uipm.schema_version === 'memact.uipm.v0', 'Schema version correct');

  let memory = await readJSON('filtent-memory.json');
  check(memory === null, 'Memory NOT stored for low evidence');

  console.log('');

  // -------------------------------------------------------
  // SCENARIO 2: Strong laptop comparison flow
  // -------------------------------------------------------
  console.log('Scenario 2: Strong laptop-comparison flow');
  await cleanupFiles();

  result = await runWithInput([
    '1',      // Browse laptops
    '1',      // Laptop X1
    '1',      // View specs
    '',       // continue
    '2',      // Read reviews
    '',       // continue
    '3',      // Compare price
    '',       // continue
    '5',      // Go back
    '2',      // Laptop Y2
    '1',      // View specs
    '',       // continue
    '3',      // Compare price
    '',       // continue
    '5',      // Go back
    '3',      // Laptop Z3
    '2',      // Read reviews
    '',       // continue
    '5',      // Go back
    '4',      // Compare laptops
    '',       // continue
    '5',      // Check student discounts
    '',       // continue
    '6',      // Back
    '1',      // Browse laptops
    '1',      // Laptop X1 (revisit)
    '4',      // Add to cart
    '',       // continue
    '5',      // Go back
    '6',      // Back
    '6',      // Run UIPM
    '',       // continue
    '9',      // Exit
  ]);

  check(result.code === 0, 'Exit code 0');
  check(!result.timedOut, 'No timeout');
  check(contains(result.stdout, 'Choosing a laptop'), 'UIPM interprets "Choosing a laptop"');
  check(contains(result.stdout, 'comparison before decision'), 'Stage is "comparison before decision"');

  log = await readJSON('filtent-activity-log.json');
  check(log !== null, 'Activity log file created');

  uipm = await readJSON('filtent-uipm-output.json');
  check(uipm !== null, 'UIPM output file created');
  check(uipm.interpreted_intent !== null, 'interpreted_intent is not null');
  check(uipm.interpreted_intent.label === 'Choosing a laptop', 'Label is "Choosing a laptop"');
  check(uipm.interpreted_intent.confidence >= 0.72, `Confidence >= 0.72 (got ${uipm.interpreted_intent.confidence})`);
  check(uipm.interpreted_intent.confidence <= 0.82, `Confidence <= 0.82 (got ${uipm.interpreted_intent.confidence})`);
  check(uipm.memory.store === true, 'Memory store is true');
  check(uipm.memory.future_agent_context === true, 'Future agent context is true');
  check(uipm.based_on.length >= 3, 'Multiple evidence items in based_on');
  check(uipm.access.raw_activity_exposed === false, 'raw_activity_exposed is false');
  check(uipm.access.approved_activity_count > 0, 'approved_activity_count > 0');
  check(JSON.stringify(uipm.feedback.available_actions) === JSON.stringify(['confirm', 'correct', 'dismiss', 'forget']), 'feedback actions are correction hooks');

  memory = await readJSON('filtent-memory.json');
  check(memory !== null, 'Memory file created');
  check(Array.isArray(memory), 'Memory is an array');
  check(memory.length === 1, 'One memory entry');
  check(memory[0].type === 'intent_memory', 'type is intent_memory');
  check(memory[0].label === 'Choosing a laptop', 'label correct');
  check(memory[0].source_app === 'Filtent', 'source_app is Filtent');
  check(memory[0].category === 'web:commerce', 'category correct');
  check(memory[0].id && memory[0].created_at, 'has id and created_at');
  check(Array.isArray(memory[0].evidence) && memory[0].evidence.length > 0, 'has evidence');

  console.log('');

  // -------------------------------------------------------
  // SCENARIO 3: Revoke access
  // -------------------------------------------------------
  console.log('Scenario 3: Revoke access — UIPM blocked');
  await cleanupFiles();

  result = await runWithInput([
    '1',      // Browse laptops
    '1',      // Laptop X1
    '1',      // View specs
    '',       // continue
    '5',      // Go back
    '6',      // Back
    '7',      // Revoke access
    '6',      // Run UIPM (should be blocked)
    '',       // continue
    '9',      // Exit
  ]);

  check(result.code === 0, 'Exit code 0');
  check(!result.timedOut, 'No timeout');
  check(contains(result.stdout, 'consent_revoked'), 'UIPM says consent_revoked');
  check(contains(result.stdout, '"allowed": false'), 'allowed is false');

  uipm = await readJSON('filtent-uipm-output.json');
  check(uipm !== null, 'UIPM output file created');
  check(uipm.allowed === false, 'allowed is false in saved output');
  check(uipm.reason === 'consent_revoked', 'reason is consent_revoked');

  console.log('');

  // -------------------------------------------------------
  // SCENARIO 4: Restore access
  // -------------------------------------------------------
  console.log('Scenario 4: Restore access — UIPM works again');
  await cleanupFiles();

  result = await runWithInput([
    '1',      // Browse laptops
    '1',      // Laptop X1
    '4',      // Add to cart
    '',       // continue
    '5',      // Go back
    '6',      // Back
    '7',      // Revoke
    '8',      // Restore
    '6',      // Run UIPM
    '',       // continue
    '9',      // Exit
  ]);

  check(result.code === 0, 'Exit code 0');
  check(!result.timedOut, 'No timeout');
  check(!contains(result.stdout, 'consent_revoked'), 'UIPM does NOT say consent_revoked');

  uipm = await readJSON('filtent-uipm-output.json');
  check(uipm !== null, 'UIPM output file created after restore');
  check(uipm.allowed === true, 'allowed is true after restore');

  console.log('');

  // -------------------------------------------------------
  // SCENARIO 5: Strong headphones comparison flow
  // -------------------------------------------------------
  console.log('Scenario 5: Strong headphones comparison flow');
  await cleanupFiles();

  result = await runWithInput([
    '2',      // Browse headphones
    '1',      // Headphones H1
    '1',      // View specs
    '',       // continue
    '2',      // Read reviews
    '',       // continue
    '3',      // Compare price
    '',       // continue
    '4',      // Add to cart
    '',       // continue
    '5',      // Go back
    '2',      // Headphones H2
    '2',      // Read reviews
    '',       // continue
    '5',      // Go back
    '1',      // Headphones H1 (revisit)
    '5',      // Go back
    '3',      // Back
    '6',      // Run UIPM
    '',       // continue
    '9',      // Exit
  ]);

  check(result.code === 0, 'Exit code 0');
  check(!result.timedOut, 'No timeout');
  check(contains(result.stdout, 'Choosing headphones'), 'UIPM interprets "Choosing headphones"');
  check(contains(result.stdout, 'comparison before decision'), 'Stage is "comparison before decision"');

  uipm = await readJSON('filtent-uipm-output.json');
  check(uipm !== null, 'UIPM output file created');
  check(uipm.interpreted_intent.label === 'Choosing headphones', 'Label is "Choosing headphones"');
  check(uipm.interpreted_intent.confidence >= 0.72, `Confidence >= 0.72 (got ${uipm.interpreted_intent.confidence})`);
  check(uipm.interpreted_intent.confidence <= 0.82, `Confidence <= 0.82 (got ${uipm.interpreted_intent.confidence})`);
  check(uipm.memory.store === true, 'Memory store is true');
  check(uipm.memory.future_agent_context === true, 'Future agent context is true');
  check(uipm.access.raw_activity_exposed === false, 'raw_activity_exposed is false');
  check(uipm.access.approved_activity_count > 0, 'approved_activity_count > 0');

  memory = await readJSON('filtent-memory.json');
  check(memory !== null, 'Memory file created');
  check(memory.length === 1, 'One memory entry');
  check(memory[0].label === 'Choosing headphones', 'Memory label is "Choosing headphones"');

  console.log('');

  // -------------------------------------------------------
  // SCENARIO 6: Strong backpack comparison flow
  // -------------------------------------------------------
  console.log('Scenario 6: Strong backpack comparison flow');
  await cleanupFiles();

  result = await runWithInput([
    '3',      // Browse backpacks
    '1',      // Backpack B1
    '1',      // View specs
    '',       // continue
    '2',      // Read reviews
    '',       // continue
    '3',      // Compare price
    '',       // continue
    '4',      // Add to cart
    '',       // continue
    '5',      // Go back
    '2',      // Backpack B2
    '2',      // Read reviews
    '',       // continue
    '5',      // Go back
    '1',      // Backpack B1 (revisit)
    '5',      // Go back
    '3',      // Back
    '6',      // Run UIPM
    '',       // continue
    '9',      // Exit
  ]);

  check(result.code === 0, 'Exit code 0');
  check(!result.timedOut, 'No timeout');
  check(contains(result.stdout, 'Choosing a backpack'), 'UIPM interprets "Choosing a backpack"');
  check(contains(result.stdout, 'comparison before decision'), 'Stage is "comparison before decision"');

  uipm = await readJSON('filtent-uipm-output.json');
  check(uipm !== null, 'UIPM output file created');
  check(uipm.interpreted_intent.label === 'Choosing a backpack', 'Label is "Choosing a backpack"');
  check(uipm.interpreted_intent.confidence >= 0.72, `Confidence >= 0.72 (got ${uipm.interpreted_intent.confidence})`);
  check(uipm.interpreted_intent.confidence <= 0.82, `Confidence <= 0.82 (got ${uipm.interpreted_intent.confidence})`);
  check(uipm.memory.store === true, 'Memory store is true');
  check(uipm.memory.future_agent_context === true, 'Future agent context is true');
  check(uipm.access.raw_activity_exposed === false, 'raw_activity_exposed is false');
  check(uipm.access.approved_activity_count > 0, 'approved_activity_count > 0');

  memory = await readJSON('filtent-memory.json');
  check(memory !== null, 'Memory file created');
  check(memory.length === 1, 'One memory entry');
  check(memory[0].label === 'Choosing a backpack', 'Memory label is "Choosing a backpack"');

  console.log('');
  console.log('='.repeat(50));
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed === 0) console.log('ALL TESTS PASSED');
  else console.log('SOME TESTS FAILED');
}

main().catch((e) => {
  console.error('Test runner error:', e);
  process.exit(1);
});
