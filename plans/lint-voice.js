#!/usr/bin/env node
/**
 * lint-voice.js — flags AI-tells and off-brand phrasing in site content.
 *
 * Usage:
 *   node plans/lint-voice.js               # lints content/**\/*.md(x)
 *   node plans/lint-voice.js some/file.mdx # lints specific file(s)
 *
 * Exit code 1 if any ERROR-level findings (safe to wire into CI later).
 * Zero deps, CommonJS to match the repo.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// --- rules -----------------------------------------------------------------

/** word/phrase blocklist: [regex, message, level] */
const PHRASE_RULES = [
  // hype adjectives
  [/\bbattle-tested\b/gi, 'hype adjective — show the battle instead', 'error'],
  [/\bworld-class\b/gi, 'hype adjective', 'error'],
  [/\bcutting[- ]edge\b/gi, 'hype adjective — name the actual tech', 'error'],
  [/\bseamless(ly)?\b/gi, 'hype adjective — nothing is seamless, say what works', 'error'],
  [/\bgame-chang(ing|er)\b/gi, 'hype adjective', 'error'],
  [/\brevolutionar(y|ise)\b/gi, 'hype adjective', 'error'],
  [/\binnovation theatre\b/gi, 'humble-brag positioning — replace with evidence', 'warn'],
  // consultant verbs
  [/\bleverag(e|ing|ed)\b/gi, 'consultant verb — use "use"', 'error'],
  [/\bpressure-test(ing|ed)?\b/gi, 'consultant verb', 'warn'],
  [/\bunlock(ing)? (value|potential|growth)\b/gi, 'consultant verb phrase', 'error'],
  [/\bsupercharg(e|ing|ed)\b/gi, 'consultant verb', 'error'],
  [/\bempower(ing|ed|s)?\b/gi, 'consultant verb — say what people can now do', 'warn'],
  [/\bsynerg(y|ies|istic)\b/gi, 'consultant noun', 'error'],
  // empty intensifiers
  [/\bgenuinely\b/gi, 'empty intensifier — cut it, the sentence survives', 'warn'],
  [/\btruly\b/gi, 'empty intensifier', 'warn'],
  [/\bdeep(ly)? (experience|expertise|knowledge)\b/gi, 'tell, not show', 'warn'],
  // AI constructions
  [/\bisn'?t just [^.\n]{3,60}[—,-] ?it'?s\b/gi, '"isn\'t just X, it\'s Y" — classic AI construction', 'error'],
  [/\bnot just [^.\n]{3,60}, but\b/gi, '"not just X, but Y" — AI cadence, often fine, check it', 'warn'],
  [/\bIn (today's|an ever-changing|a rapidly evolving)\b/gi, 'AI opener', 'error'],
  [/\b(navigate|navigating) the (complex|evolving|shifting) (landscape|world)\b/gi, 'AI filler metaphor', 'error'],
  [/\bdelve\b/gi, 'the most famous AI-tell of all', 'error'],
  // US spellings (site is UK English)
  [/\btokenization\b/g, 'US spelling — use "tokenisation"', 'error'],
  [/\borganizations?\b/g, 'US spelling — use "organisation(s)"', 'error'],
  [/\bcolor\b/g, 'US spelling — use "colour" (prose only; CSS is fine)', 'warn'],
];

// --- structural checks -------------------------------------------------------

function structuralFindings(text) {
  const findings = [];
  const paragraphs = text.split(/\n\s*\n/);

  paragraphs.forEach((p, i) => {
    const plain = p.replace(/```[\s\S]*?```/g, '').trim();
    if (!plain || plain.startsWith('#') || plain.startsWith('|') || plain.startsWith('---')) return;

    // em-dash density: > 2 per paragraph is suspicious
    const emDashes = (plain.match(/—/g) || []).length;
    if (emDashes > 2) {
      findings.push({ line: lineOf(text, p), level: 'warn', msg: `paragraph ${i + 1}: ${emDashes} em-dashes — vary the punctuation` });
    }

    // fragment stacking: 3+ consecutive sentences of <= 4 words
    const sentences = plain.split(/(?<=[.!?])\s+/).filter(Boolean);
    let streak = 0;
    for (const s of sentences) {
      const words = s.replace(/[^\w\s']/g, '').trim().split(/\s+/).filter(Boolean).length;
      streak = words > 0 && words <= 4 ? streak + 1 : 0;
      if (streak >= 3) {
        findings.push({ line: lineOf(text, p), level: 'warn', msg: 'fragment stacking ("Ten years. One community. An exit.") — write real sentences' });
        break;
      }
    }

    // triad detection: "x, y, and z" of single adjectives at sentence end
    if (/\b\w+, \w+, (and |& )?\w+[.!]/.test(plain) && /\b(quiet|durable|fast|simple|secure|honest|proven)\b/i.test(plain)) {
      findings.push({ line: lineOf(text, p), level: 'warn', msg: 'possible adjective triad — AI cadence, check it reads human' });
    }
  });

  return findings;
}

function lineOf(text, fragment) {
  const idx = text.indexOf(fragment.slice(0, 60));
  return idx === -1 ? 1 : text.slice(0, idx).split('\n').length;
}

// --- runner ------------------------------------------------------------------

function collectFiles(args) {
  if (args.length) return args.map((f) => path.resolve(f));
  const dir = path.join(ROOT, 'content');
  const out = [];
  (function walk(d) {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(md|mdx)$/.test(entry.name)) out.push(full);
    }
  })(dir);
  return out;
}

let errors = 0;
let warns = 0;

for (const file of collectFiles(process.argv.slice(2))) {
  const text = fs.readFileSync(file, 'utf8');
  const findings = [];

  for (const [re, msg, level] of PHRASE_RULES) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(text)) !== null) {
      const line = text.slice(0, m.index).split('\n').length;
      findings.push({ line, level, msg: `"${m[0]}" — ${msg}` });
    }
  }
  findings.push(...structuralFindings(text));

  if (findings.length) {
    console.log(`\n${path.relative(ROOT, file)}`);
    findings
      .sort((a, b) => a.line - b.line)
      .forEach((f) => {
        const tag = f.level === 'error' ? 'ERROR' : 'warn ';
        if (f.level === 'error') errors++; else warns++;
        console.log(`  L${String(f.line).padStart(3)} [${tag}] ${f.msg}`);
      });
  }
}

console.log(`\n${errors} error(s), ${warns} warning(s).`);
console.log('Zero warnings is not the goal — zero unjustified warnings is.');
process.exit(errors > 0 ? 1 : 0);
