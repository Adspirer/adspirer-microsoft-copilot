import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import AdmZip from 'adm-zip';
import { configuration, render, validate, root, previewId, previewAuth } from '../scripts/lib.mjs';
import { generateInstructions } from '../scripts/generate.mjs';

test('configured builds reject missing, synthetic, and malformed registrations', () => {
  assert.throws(() => configuration({}), /TEAMS_APP_ID/);
  assert.throws(() => configuration({ TEAMS_APP_ID: previewId, ADSPIRER_AUTH_CONFIG_ID: 'real-reference' }), /preview IDs/);
  assert.throws(() => configuration({ TEAMS_APP_ID: '22222222-2222-4222-8222-222222222222', ADSPIRER_AUTH_CONFIG_ID: previewAuth }), /real Microsoft OAuth/);
  assert.throws(() => configuration({ TEAMS_APP_ID: '22222222-2222-4222-8222-222222222222', ADSPIRER_AUTH_CONFIG_ID: '${{SECRET}}' }), /real Microsoft OAuth/);
});

test('preview ignores real tenant values from the environment', () => {
  assert.deepEqual(configuration({ TEAMS_APP_ID: 'private-id', ADSPIRER_AUTH_CONFIG_ID: 'private-reference' }, true), {
    TEAMS_APP_ID: previewId, ADSPIRER_AUTH_CONFIG_ID: previewAuth, APP_NAME_SUFFIX: ' Preview',
  });
});

test('schema checks reject wrong versions, unknown fields, and OpenAPI fields in MCP', () => {
  const good = () => render(configuration({}, true));
  validate(good());
  const version = good(); version['declarativeAgent.json'].version = 'v0.0';
  assert.throws(() => validate(version), /constant/);
  const extra = good(); extra['ai-plugin.json'].runtimes[0].spec.progress_style = 'None';
  assert.throws(() => validate(extra), /additional properties/);
  const rootField = good(); rootField['declarativeAgent.json'].unrecognizedField = true;
  assert.throws(() => validate(rootField), /property name/);
});

test('connection checks reject anonymous auth, endpoint drift, and broken references', () => {
  for (const change of [
    m => { m['ai-plugin.json'].runtimes[0].auth = { type: 'None' }; },
    m => { m['ai-plugin.json'].runtimes[0].spec.url = 'https://example.com/mcp'; },
    m => { m['declarativeAgent.json'].actions[0].file = '../private.json'; },
  ]) {
    const manifests = render(configuration({}, true));
    change(manifests);
    assert.throws(() => validate(manifests));
  }
});

test('instructions reproduce pinned sources within the host limit', () => {
  const expected = generateInstructions();
  assert.equal(readFileSync(resolve(root,'agent/appPackage/instruction.txt'),'utf8'),expected);
  assert.ok(expected.length <= 8000);
  assert.doesNotMatch(expected, /<!-- BEGIN:|\{\{[A-Z_]+\}\}|skills_list|cronjob|\/adspirer:setup/);
});

test('ZIP is deterministic and includes only manifests/icons, without environment secrets', () => {
  const build = () => execFileSync(process.execPath,['scripts/package.mjs','--preview'],{
    cwd:root, env:{...process.env,TEAMS_APP_ID:'PRIVATE_TENANT_SENTINEL',ADSPIRER_AUTH_CONFIG_ID:'PRIVATE_AUTH_SENTINEL',SECRET_CLIENT_SECRET:'SECRET_SENTINEL'},stdio:'pipe',
  });
  build();
  const path=resolve(root,'dist/preview/adspirer-copilot-preview.zip');
  const first=readFileSync(path);
  build();
  assert.deepEqual(first,readFileSync(path));
  const zip=new AdmZip(first);
  assert.deepEqual(zip.getEntries().map(e=>e.entryName).sort(),['ai-plugin.json','color.png','declarativeAgent.json','manifest.json','outline.png']);
  for (const e of zip.getEntries().filter(e=>e.entryName.endsWith('.json')))
    assert.doesNotMatch(e.getData().toString(),/PRIVATE_TENANT_SENTINEL|PRIVATE_AUTH_SENTINEL|SECRET_SENTINEL|\$\{\{|\$\[file\(/);
  assert.equal(JSON.parse(zip.readAsText('manifest.json')).id,previewId);
});

test('configured packaging fails closed without tenant configuration', () => {
  const result=spawnSync(process.execPath,['scripts/package.mjs'],{cwd:root,env:{...process.env,TEAMS_APP_ID:'',ADSPIRER_AUTH_CONFIG_ID:''},encoding:'utf8'});
  assert.notEqual(result.status,0);
  assert.match(result.stderr,/real Microsoft app registration ID/);
});
