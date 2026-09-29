# Implementation and provenance

## Host adaptation

Scaffolded using Microsoft 365 Agents Toolkit CLI 1.1.17 and its remote MCP template. Retains its schema versions: app 1.30, declarative agent 1.8, plugin 2.4.

The shared `ads-mcp` skills have newer router guidance than the older Cursor agent prompt. This package takes the safety contract, router two-step, decimal budget rule, account parameter map, and scorecard from pinned shared skills. The repetitive budget table is omitted to fit the 8,000-character instruction limit; its unit rule is preserved. Revisions and hashes are in `sources/lock.json`.

Cursor contributed the existing brand icon and brand-aware workflow. Hermes informed money approval, paused creation, readback, and transparent authentication. Copilot receives compact instructions instead of being asked to load unavailable local skills. Filesystem scanning, Hermes cron, persistent local memory, and automatic public reporting are not assumed.

To update shared guidance, review a specific upstream commit, refresh selected vendored files and their revision/hash entries, run `npm run generate`, and review the result. Preserve upstream notices in `sources/LICENSE`. Do not edit generated instructions directly.

`npm run generate:icons` exports Microsoft-sized icons from the pinned Cursor PNG. The source's opaque black matte is removed for the white-on-transparent outline.

## Discovery and authorization

One `RemoteMCPServer` uses dynamic discovery with an empty functions array and `run_for_functions: ["*"]`. No backend schemas are fabricated or pinned from stale documentation. The tool surface can change and includes routers mixing reads and writes. Prompt approval rules are not access-control enforcement: verify live annotations, Microsoft confirmations, account isolation, and backend permissions before enabling mutations.

DCR is initially scoped to this app and home tenant. Public OAuth metadata was readable during development. Registration, secret issuance, login, token refresh, and authenticated Microsoft tool calls have not been exercised.

## Local schema limitation

The official plugin v2.4 schema bundled with CLI 1.1.17 contains an overlapping `oneOf`: a `spec` containing only `url` matches both OpenAPI and MCP branches. Microsoft's CLI generates that exact shape for dynamic discovery, and its documentation requires omitting `mcp_tool_description`.

Our local validator narrows `runtime.type` to `RemoteMCPServer` and selects the unchanged official MCP spec branch. Other constraints remain in force. It does not add a fake pinned tool list or weaken validation to accept arbitrary fields. Regression tests reject OpenAPI-only properties and invalid runtime/auth configurations.

Unmodified app and agent schemas pass locally. Microsoft's full `atk validate` opened a login flow; it was stopped without authentication. Tenant validation is pending. Revisit the discriminator adaptation when upgrading the CLI.

References: [dynamic discovery](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/plugin-dynamic-tool-discovery), [plugin schema](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/plugin-manifest-2.4), [DCR requirements](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/plugin-authentication-dynamic-client-registration).
