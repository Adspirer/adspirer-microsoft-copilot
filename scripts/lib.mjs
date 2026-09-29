import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import Ajv from 'ajv-draft-04';
import AjvModern from 'ajv';
import addFormats from 'ajv-formats';
import { PNG } from 'pngjs';
import YAML from 'yaml';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const previewId = '11111111-1111-4111-8111-111111111111';
export const previewAuth = 'PREVIEW-NOT-REGISTERED';
export const json = path => JSON.parse(readFileSync(resolve(root, path), 'utf8'));
export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

export function verifySources() {
  for (const source of json('sources/lock.json').sources) {
    if (sha256(readFileSync(resolve(root, source.localPath))) !== source.sha256)
      throw new Error(`Pinned source changed: ${source.localPath}`);
  }
}

export function validateLifecycle() {
  const document = YAML.parse(readFileSync(resolve(root, 'agent/m365agents.yml'), 'utf8'));
  const ajv = new AjvModern({ strict: false, allErrors: true });
  addFormats(ajv);
  const check = ajv.compile(json('node_modules/@microsoft/m365agentstoolkit-cli/resource/yaml-schema/v1.13/yaml.schema.json'));
  if (!check(document)) throw new Error(`Lifecycle: ${ajv.errorsText(check.errors)}`);
  if (document.publish || document.deploy || document.provision.length !== 2 ||
      document.provision[0].uses !== 'teamsApp/create' || document.provision[1].uses !== 'dcr/register')
    throw new Error('Pilot lifecycle must only register the app and OAuth configuration.');
  const auth = document.provision[1].with;
  if (auth.applicableToApps !== 'SpecificApp' || auth.targetAudience !== 'HomeTenant' ||
      auth.appId !== '${{TEAMS_APP_ID}}' ||
      auth.wellKnownAuthorizationServer !== 'https://mcp.adspirer.com/.well-known/oauth-authorization-server' ||
      JSON.stringify(auth.targetUrlsShouldStartWith) !== '["https://mcp.adspirer.com/mcp"]')
    throw new Error('Pilot OAuth configuration must stay scoped to this app, tenant, and service.');
}

export function configuration(env, preview = false) {
  if (preview) return { TEAMS_APP_ID: previewId, ADSPIRER_AUTH_CONFIG_ID: previewAuth, APP_NAME_SUFFIX: ' Preview' };
  const appId = env.TEAMS_APP_ID?.trim();
  const authId = env.ADSPIRER_AUTH_CONFIG_ID?.trim();
  if (!appId || !/^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(appId) || appId === previewId)
    throw new Error('Set TEAMS_APP_ID to the real Microsoft app registration ID; preview IDs cannot produce a configured package.');
  if (!authId || !/^[A-Za-z0-9_-]+$/.test(authId) || /preview|placeholder|changeme|example/i.test(authId))
    throw new Error('Set ADSPIRER_AUTH_CONFIG_ID to the real Microsoft OAuth configuration reference, never a client secret.');
  return { TEAMS_APP_ID: appId, ADSPIRER_AUTH_CONFIG_ID: authId, APP_NAME_SUFFIX: env.APP_NAME_SUFFIX ?? '-dev' };
}

export function render(config) {
  const manifests = {};
  for (const name of ['manifest.json', 'declarativeAgent.json', 'ai-plugin.json']) {
    const source = json(`agent/appPackage/${name}`);
    const walk = value => {
      if (typeof value === 'string') {
        if (value === "$[file('instruction.txt')]") return readFileSync(resolve(root, 'agent/appPackage/instruction.txt'), 'utf8');
        return value.replace(/\$\{\{([A-Z_]+)\}\}/g, (_, key) => {
          if (!(key in config)) throw new Error(`Unresolved manifest variable: ${key}`);
          return config[key];
        });
      }
      if (Array.isArray(value)) return value.map(walk);
      if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k,v]) => [k,walk(v)]));
      return value;
    };
    manifests[name] = walk(source);
  }
  return manifests;
}

export function validate(manifests) {
  const ajv = new Ajv({ strict: false, allErrors: true });
  addFormats(ajv);
  // Official schemas bundled with the exactly pinned Microsoft CLI; no network required.
  const base = 'node_modules/@microsoft/m365agentstoolkit-cli/json-schemas/';
  const schemas = {
    'manifest.json': 'teams/v1.30/MicrosoftTeams.schema.json',
    'declarativeAgent.json': 'copilot/declarative-agent/v1.8/schema.json',
    'ai-plugin.json': 'copilot/plugin/v2.4/schema.json',
  };
  for (const [file,path] of Object.entries(schemas)) {
    const schema = json(base + path);
    if (file === 'ai-plugin.json') {
      // Microsoft's v2.4 schema has overlapping url-only OpenApi/MCP oneOf
      // branches. Select the MCP branch by runtime.type for this MCP-only app.
      // Preserve the official MCP spec constraints; never add a fake pinned tool
      // list to make the union exclusive (that would disable dynamic discovery).
      const spec = schema.$defs.runtime.properties.spec;
      if (!spec.oneOf?.some(x => x.$ref === '#/$defs/mcp-execution-spec'))
        throw new Error('Microsoft runtime schema changed; review the discriminator workaround.');
      schema.$defs.runtime.properties.type = { const: 'RemoteMCPServer' };
      schema.$defs.runtime.properties.spec = { $ref: '#/$defs/mcp-execution-spec' };
    }
    const check = ajv.compile(schema);
    if (!check(manifests[file])) throw new Error(`${file}: ${ajv.errorsText(check.errors, { separator: '\n' })}`);
    if (/\$\{\{|\$\[file\(/.test(JSON.stringify(manifests[file]))) throw new Error(`Unresolved template in ${file}`);
  }
  const app = manifests['manifest.json'];
  const agent = manifests['declarativeAgent.json'];
  const plugin = manifests['ai-plugin.json'];
  if (app.copilotAgents.declarativeAgents[0].file !== 'declarativeAgent.json' || agent.actions[0].file !== 'ai-plugin.json')
    throw new Error('Broken manifest references.');
  if (agent.instructions.length > 8000) throw new Error('Agent instructions exceed 8000 characters.');
  if (plugin.runtimes.length !== 1 || plugin.functions.length !== 0) throw new Error('Expected one dynamic MCP runtime.');
  const runtime = plugin.runtimes[0];
  if (runtime.type !== 'RemoteMCPServer' || runtime.spec.url !== 'https://mcp.adspirer.com/mcp' || JSON.stringify(runtime.run_for_functions) !== '["*"]')
    throw new Error('MCP connection differs from the reviewed service configuration.');
  if (runtime.auth.type !== 'OAuthPluginVault' || !runtime.auth.reference_id) throw new Error('OAuth configuration is required.');
  if (app.permissions?.length || app.bots?.length || app.composeExtensions?.length) throw new Error('Unexpected additional app permissions or surfaces.');
  for (const [file,dimension] of [['color.png',192],['outline.png',32]]) {
    const png = PNG.sync.read(readFileSync(resolve(root, 'agent/appPackage', file)));
    if (png.width !== dimension || png.height !== dimension) throw new Error(`Invalid ${file} dimensions.`);
    if (file === 'outline.png') {
      let visible = false;
      for (let i=0;i<png.data.length;i+=4) {
        if (png.data[i+3]) {
          visible = true;
          if (png.data[i] !== 255 || png.data[i+1] !== 255 || png.data[i+2] !== 255) throw new Error('Outline icon must be white on transparent.');
        }
      }
      if (!visible || !png.data.some((x,i) => i%4===3 && x===0)) throw new Error('Outline icon must contain a visible mark and transparency.');
    }
  }
}
