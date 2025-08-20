/* Outil CLI: construction d'un mini-modèle d'intentions basé similarité
Usage:
  node scripts/qna_intents_build.js --output ./data/intents_model.json

Le modèle contient une table question_normalisée -> index dans questionTemplates.
*/

const fs = require('fs');
const path = require('path');

const OUTPUT_FLAG = '--output';

function parseArgs() {
  const args = process.argv.slice(2);
  const outIdx = args.indexOf(OUTPUT_FLAG);
  const output = outIdx !== -1 ? args[outIdx + 1] : './data/intents_model.json';
  return { output };
}

function normalize(text) {
  return (text || '')
    .toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}+/gu, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text) {
  return normalize(text).split(' ').filter(Boolean);
}

function buildModel(templates) {
  const index = {};
  templates.forEach((t, i) => {
    const n = normalize(t.question);
    if (!n) return;
    index[n] = { templateIndex: i, categorie: t.categorie };
  });
  return { version: 1, size: Object.keys(index).length, index };
}

function main() {
  const { output } = parseArgs();
  const { questionTemplates } = require(path.resolve(__dirname, '..', 'questionTemplates.js'));
  const model = buildModel(questionTemplates);
  const outPath = path.resolve(process.cwd(), output);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(model, null, 2), 'utf-8');
  console.log(`✅ Modèle d'intentions généré: ${outPath} (entrées: ${model.size})`);
}

main();





