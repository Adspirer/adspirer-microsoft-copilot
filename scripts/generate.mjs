import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { verifySources, root } from './lib.mjs';

export function generateInstructions() {
  verifySources();
  const skill = name => readFileSync(resolve(root, `sources/ads-mcp/shared/skills/platform/${name}/SKILL.md`), 'utf8');
  const section = (text, heading) => {
    const marker = `## ${heading}\n`;
    const start = text.indexOf(marker);
    if (start < 0) throw new Error(`Missing upstream section: ${heading}`);
    const end = text.indexOf('\n## ', start + marker.length);
    return text.slice(start, end < 0 ? undefined : end).trim();
  };
  const mcp = skill('adspirer-mcp');
  const budgetSection = section(mcp, 'Budgets: the unit differs per platform');
  const budgetStart = budgetSection.indexOf('**Every platform');
  if (budgetStart < 0) throw new Error('Upstream budget rule changed; review the adaptation.');
  const fragments = {
    SAFETY: section(skill('adspirer-agent'), 'The safety contract'),
    ROUTER: section(mcp, 'The router two-step'),
    // All six table rows repeat the same decimal unit; keep the authoritative rule.
    BUDGETS: '## Budgets\n\n' + budgetSection.slice(budgetStart),
    ACCOUNTS: section(mcp, 'Accounts'),
    SCORECARD: section(skill('adspirer-performance-review'), 'The scorecard'),
  };
  const template = readFileSync(resolve(root, 'agent/instructions.template.md'), 'utf8');
  const text = template.replace(/\{\{([A-Z]+)\}\}/g, (_, name) => {
    if (!(name in fragments)) throw new Error(`Unknown instruction fragment: ${name}`);
    return fragments[name];
  });
  if (text.length > 8000) throw new Error(`Instructions exceed Microsoft's 8000-character limit: ${text.length}`);
  return text;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const text = generateInstructions();
  const path = resolve(root, 'agent/appPackage/instruction.txt');
  if (process.argv.includes('--check')) {
    if (readFileSync(path, 'utf8') !== text) throw new Error('Generated instructions are stale; run npm run generate.');
  } else writeFileSync(path, text);
  console.log(`Instructions verified: ${text.length}/8000 characters.`);
}
