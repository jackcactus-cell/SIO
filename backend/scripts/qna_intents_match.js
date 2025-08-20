/* Outil CLI: matcher une question utilisateur contre le modèle d'intentions
Usage:
  node scripts/qna_intents_match.js --question "ma question" [--model ./data/intents_model.json]
*/

const fs = require('fs');
const path = require('path');

const QUESTION_FLAG = '--question';
const MODEL_FLAG = '--model';

function parseArgs() {
  const args = process.argv.slice(2);
  const qIdx = args.indexOf(QUESTION_FLAG);
  if (qIdx === -1 || !args[qIdx + 1]) {
    console.error('Préciser --question "..."');
    process.exit(1);
  }
  const mIdx = args.indexOf(MODEL_FLAG);
  const modelPath = mIdx !== -1 && args[mIdx + 1] ? args[mIdx + 1] : './data/intents_model.json';
  return { question: args[qIdx + 1], modelPath };
}

function normalize(text) {
  return (text || '')
    .toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}+/gu, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function bestMatch(question, model) {
  const nq = normalize(question);
  const words = nq.split(' ').filter(Boolean);
  let best = { key: null, score: 0 };
  for (const key of Object.keys(model.index)) {
    const kWords = key.split(' ');
    const overlap = words.filter(w => kWords.includes(w)).length;
    const score = overlap / Math.max(kWords.length, 1);
    if (score > best.score) {
      best = { key, score };
    }
  }
  return best;
}

function main() {
  const { question, modelPath } = parseArgs();
  const model = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), modelPath), 'utf-8'));
  const match = bestMatch(question, model);
  console.log(JSON.stringify({ question, match }, null, 2));
}

main();





