# Build and test Adspirer in Microsoft 365 Copilot

## Local build

Use Node.js 22+ and npm from the repository root:

```sh
npm ci
npm run check
npm run check:metadata
```

`check` verifies source integrity, generated instructions, local schemas, references, icons, regression tests, and the preview ZIP. It does not provision resources or contact advertising accounts. `check:metadata` separately reads public OAuth metadata.

The preview uses synthetic IDs and is not installable. Tests and CI require no Microsoft credentials. Dependencies are pinned, including Agents Toolkit CLI 1.1.17. The `adm-zip` override selects 0.6.1 to avoid vulnerabilities in older transitive versions. CI skips dependency install scripts because offline checks do not need a native credential store.

## Microsoft tenant prerequisites

- Microsoft 365 tenant with an administrator able to enable custom app uploads and the intended Copilot experience.
- Licensing or usage billing appropriate to the features tested; free developer sandbox eligibility is not guaranteed.
- Adspirer test account with controlled advertising data; a second account for isolation checks.

An existing business email address alone is not a Microsoft work account. New organizations can use the [Microsoft 365 business signup](https://learn.microsoft.com/en-us/microsoft-365/commerce/try-or-buy-microsoft-365?view=o365-worldwide) and initially sign in with the assigned `onmicrosoft.com` identity. A custom domain can be configured later; using that identity does not require moving existing email hosting.

No tenant has been configured by this implementation. Microsoft's full `atk validate` command can require sign-in even with `--interactive false`; it is not an offline check.

## Register an authorized pilot

These commands change tenant state. Run them only after the target tenant and registration are authorized:

```sh
cp agent/env/.env.example agent/env/.env.dev
npm run atk -- auth login m365
npm run atk -- provision --folder agent --env dev --interactive false
```

The lifecycle creates an app registration and a DCR auth configuration restricted to `SpecificApp` and `HomeTenant`. It writes `TEAMS_APP_ID` and `ADSPIRER_AUTH_CONFIG_ID` into the ignored environment file. It does not publish to a catalog or marketplace.

Microsoft DCR requires the authorization server to issue a client secret and uses PKCE. Adspirer's public metadata advertises registration and `client_secret_basic`; actual secret issuance and the Microsoft OAuth exchange remain untested. If DCR fails, inspect the exchange and consider a separately configured static OAuth registration. Never change the plugin to anonymous authentication.

## Configured package and tenant test

After registration supplies real IDs:

```sh
node --env-file=agent/env/.env.dev scripts/package.mjs
```

Output: `dist/configured/adspirer-copilot-configured.zip`. An explicit five-file allowlist excludes environment files. The auth configuration ID references Microsoft's token store; it is not a client secret.

In the authorized tenant:

```sh
npm run atk -- validate --package-file dist/configured/adspirer-copilot-configured.zip --validate-method validation-rules --interactive false
npm run atk -- install --file-path dist/configured/adspirer-copilot-configured.zip --scope Personal --interactive false
```

Open Microsoft 365 Copilot, locate the agent, sign in to Adspirer, and run [the evaluation checklist](evaluation.md). Record actual results before claiming installation or tool support. Advertising mutations require approval for the specific test operations.

## Public distribution

Partner Center verification, Microsoft 365 and Copilot program enrollment, reviewer access, listing assets, and Microsoft's review remain required. The pilot auth configuration is home-tenant only; assess multitenant OAuth and customer onboarding before public submission.

The Copilot Studio certified connector is a separate package, not implemented yet. Agent Store publication, connector certification, and federated gallery inclusion are distinct milestones.

## Official references

- [Agents Toolkit CLI](https://learn.microsoft.com/en-us/microsoftteams/platform/toolkit/microsoft-365-agents-toolkit-cli)
- [Development prerequisites](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/prerequisites)
- [MCP plugin integration](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/build-mcp-plugins)
- [Dynamic client registration](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/plugin-authentication-dynamic-client-registration)
- [MCP certification](https://learn.microsoft.com/en-us/microsoft-copilot-studio/mcp-server-certification)
