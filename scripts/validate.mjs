import { configuration, render, validate, validateLifecycle } from './lib.mjs';
import { generateInstructions } from './generate.mjs';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { root } from './lib.mjs';

if (generateInstructions() !== readFileSync(resolve(root, 'agent/appPackage/instruction.txt'), 'utf8'))
  throw new Error('Instructions are stale; run npm run generate.');
validate(render(configuration({}, true)));
validateLifecycle();
console.log('Local Microsoft schema checks passed (v2.4 MCP union disambiguated by runtime.type); references, OAuth, icons, and source integrity checked. Microsoft tenant/runtime validation is still required.');
