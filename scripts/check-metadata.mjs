// Public discovery only. No OAuth registration, login, token exchange, or ad calls.
const origin = 'https://mcp.adspirer.com';
async function get(path) {
  const response = await fetch(origin + path, { signal: AbortSignal.timeout(15000), redirect: 'error' });
  if (!response.ok) throw new Error(`Metadata request failed: HTTP ${response.status}`);
  return response.json();
}
const [resource,auth] = await Promise.all([get('/.well-known/oauth-protected-resource'),get('/.well-known/oauth-authorization-server')]);
if (resource.resource !== origin || !resource.authorization_servers?.includes(origin)) throw new Error('Unexpected protected resource identity.');
if (auth.issuer !== origin) throw new Error('Unexpected authorization server.');
for (const key of ['authorization_endpoint','token_endpoint','registration_endpoint']) {
  const url = new URL(auth[key]);
  if (url.origin !== origin) throw new Error(`Unexpected ${key} origin.`);
}
if (!auth.code_challenge_methods_supported?.includes('S256')) throw new Error('PKCE S256 not advertised.');
if (!auth.token_endpoint_auth_methods_supported?.includes('client_secret_basic')) throw new Error('Confidential-client support not advertised.');
console.log('Public discovery metadata passed: resource, issuer, registration, authorization/token endpoints, PKCE S256, and client_secret_basic.');
console.log('Client-secret issuance and Microsoft OAuth/token refresh are not tested by this check.');
