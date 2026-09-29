import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import AdmZip from 'adm-zip';
import { configuration, render, validate, root, sha256 } from './lib.mjs';
import { generateInstructions } from './generate.mjs';

const args = process.argv.slice(2);
if (args.some(x => x !== '--preview')) throw new Error('Supported argument: --preview. Supply tenant IDs via environment variables.');
const preview = args.includes('--preview');
const config = configuration(process.env, preview);
if (generateInstructions() !== readFileSync(resolve(root, 'agent/appPackage/instruction.txt'), 'utf8')) throw new Error('Run npm run generate first.');
const manifests = render(config);
validate(manifests);
const destination = resolve(root, 'dist', preview ? 'preview' : 'configured');
rmSync(destination, { recursive: true, force: true });
mkdirSync(destination, { recursive: true });
const zip = new AdmZip();
// Explicit allowlist: source files, local env files, and credentials never enter a package.
const contents = Object.fromEntries(Object.entries(manifests).map(([name,value]) => [name,Buffer.from(JSON.stringify(value,null,2)+'\n')]));
for (const name of ['color.png','outline.png']) contents[name]=readFileSync(resolve(root,'agent/appPackage',name));
for (const [name,data] of Object.entries(contents)) {
  writeFileSync(resolve(destination,name),data);
  zip.addFile(name,data);
  // ZIP stores local DOS time; use local midnight to match across host timezones.
  zip.getEntry(name).header.time = new Date(2026, 0, 1, 0, 0, 0);
}
const bytes = zip.toBuffer();
const filename = `adspirer-copilot-${preview ? 'preview' : 'configured'}.zip`;
writeFileSync(resolve(destination,filename),bytes);
writeFileSync(resolve(destination,'build-report.json'),JSON.stringify({
  mode: preview ? 'preview-only-not-installable' : 'configured-unverified-in-tenant',
  package: filename, sha256: sha256(bytes), files: Object.keys(contents).sort(),
  checks: { schemas: 'passed-with-documented-v2.4-runtime-discriminator', sourceIntegrity: 'passed', tenantInstallation: 'not-tested', oauth: 'not-tested', toolExecution: 'not-tested', certification: 'not-submitted' },
},null,2)+'\n');
console.log(`${filename}: ${sha256(bytes)}`);
console.log(preview ? 'PREVIEW ONLY: synthetic app/auth references. Do not upload this ZIP.' : 'Configured package built. Verify the registration, OAuth, and tools in the target tenant before distribution.');
