/* Outil CLI: merge et validation de Q/R vers questionTemplates.js
Usage:
  node scripts/qna_merge.js --input ./data/qna_sample.json [--dry]
*/

const fs = require('fs');
const path = require('path');

const INPUT_FLAG = '--input';
const DRY_FLAG = '--dry';

function parseArgs() {
  const args = process.argv.slice(2);
  const inputIdx = args.indexOf(INPUT_FLAG);
  const dryRun = args.includes(DRY_FLAG);
  if (inputIdx === -1 || !args[inputIdx + 1]) {
    console.error('Erreur: préciser --input <fichier.json>');
    process.exit(1);
  }
  return { input: args[inputIdx + 1], dryRun };
}

function loadJson(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

function loadQuestionTemplates(templatesPath) {
  // Chargement du fichier JS et extraction du tableau exporté
  const mod = require(templatesPath);
  return { templates: mod.questionTemplates, templatesPath };
}

function normalizeQuestion(q) {
  return q.trim().replace(/\s+/g, ' ').toLowerCase();
}

function validateEntry(entry) {
  if (!entry || typeof entry !== 'object') return 'Entrée invalide';
  if (!entry.question || typeof entry.question !== 'string') return 'question manquante';
  if (!entry.categorie || typeof entry.categorie !== 'string') return 'categorie manquante';
  if (!Array.isArray(entry.champs)) return 'champs doit être un tableau';
  if (!entry.reponse || typeof entry.reponse !== 'string') return 'reponse manquante';
  return null;
}

function mergeQuestions(existing, incoming) {
  const normalizedToIndex = new Map();
  existing.forEach((q, idx) => normalizedToIndex.set(normalizeQuestion(q.question), idx));

  const report = { added: 0, updated: 0, skipped: 0, errors: [] };

  incoming.forEach((entry) => {
    const err = validateEntry(entry);
    if (err) {
      report.errors.push({ entry, error: err });
      return;
    }
    const key = normalizeQuestion(entry.question);
    if (normalizedToIndex.has(key)) {
      // mise à jour si différence
      const idx = normalizedToIndex.get(key);
      const prev = existing[idx];
      const changed = JSON.stringify(prev) !== JSON.stringify(entry);
      if (changed) {
        existing[idx] = entry;
        report.updated += 1;
      } else {
        report.skipped += 1;
      }
    } else {
      existing.push(entry);
      report.added += 1;
    }
  });

  return report;
}

function writeBack(templatesJsPath, updatedArray, dryRun) {
  if (dryRun) {
    console.log('[DRY RUN] Changements non écrits.');
    return;
  }
  // Réécriture minimale: on remplace le contenu du tableau `questionTemplates = [ ... ];`
  const fileContent = fs.readFileSync(templatesJsPath, 'utf-8');
  const start = fileContent.indexOf('const questionTemplates = [');
  const end = fileContent.indexOf('];', start);
  if (start === -1 || end === -1) {
    throw new Error('Impossible de localiser questionTemplates dans questionTemplates.js');
  }
  const before = fileContent.slice(0, start);
  const after = fileContent.slice(end + 2);
  const serialized = JSON.stringify(updatedArray, null, 2)
    .replace(/"(\w+)":/g, '"$1":');
  const newContent = `${before}const questionTemplates = ${serialized};${after}`;
  fs.writeFileSync(templatesJsPath, newContent, 'utf-8');
}

function main() {
  const { input, dryRun } = parseArgs();
  const inputPath = path.resolve(process.cwd(), input);
  const { templates, templatesPath } = loadQuestionTemplates(path.resolve(__dirname, '..', 'questionTemplates.js'));
  const incoming = loadJson(inputPath);

  if (!Array.isArray(incoming)) {
    console.error('Le fichier d\'entrée doit contenir un tableau d\'objets Q/R.');
    process.exit(1);
  }

  const working = templates.slice();
  const report = mergeQuestions(working, incoming);
  console.log('Résumé merge:', report);

  try {
    writeBack(path.resolve(__dirname, '..', 'questionTemplates.js'), working, dryRun);
    console.log('✅ Terminé.');
  } catch (e) {
    console.error('❌ Erreur d\'écriture:', e.message);
    process.exit(1);
  }
}

main();





