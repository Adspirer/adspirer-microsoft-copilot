# Adspirer Advertising Agent

A Microsoft 365 Copilot declarative agent with a remote MCP plugin. It uses Microsoft's Copilot orchestration and Adspirer's existing backend; this package needs no separate bot server or model API key.

## Files

- `appPackage/manifest.json`: app, branding, and agent reference.
- `appPackage/declarativeAgent.json`: six conversation starters and plugin reference.
- `appPackage/ai-plugin.json`: dynamic MCP discovery and OAuth vault reference.
- `instructions.template.md`: Microsoft adaptation and shared-section insertion points.
- `appPackage/instruction.txt`: generated instructions; do not edit directly.
- `m365agents.yml`: explicit pilot registration lifecycle, scoped to this app and home tenant.
- `env/.env.example`: configuration names only; copy to an ignored `.env.dev`.

Run commands from the repository root. [Setup](../docs/setup.md) separates local builds, registration, and tenant verification. No publishing action is included in the lifecycle file.

Dynamic discovery uses `functions: []` and `run_for_functions: ["*"]`. Available tools change with the backend and the user's permissions. This is not a read-only allowlist: platform routers can execute mutations. See [evaluation](../docs/evaluation.md) before enabling campaign changes in a tenant.
