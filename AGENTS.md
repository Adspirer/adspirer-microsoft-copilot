# Repository guidance

This is the Microsoft distribution workspace for Adspirer. Read README.md and docs/setup.md before implementation.

- Keep Microsoft-specific agent and connector artifacts here. Shared advertising instructions and skills remain owned by `amekala/ads-mcp`; generate copies from an explicit source revision when needed.
- Reuse the hosted MCP service. Do not duplicate the advertising backend in this repository.
- Prefer the Microsoft 365 Agents Toolkit CLI for terminal workflows. Verify current schemas and CLI options against Microsoft's documentation before creating packages.
- Treat the declarative-agent package and Copilot Studio connector as separate artifacts with separate validation and submission requirements.
- Preserve the service's campaign approval behavior. Accurately annotate read and write tools; never mark mutations as read-only to satisfy a host requirement.
- Never commit tokens, OAuth client secrets, tenant environment files, reviewer credentials, customer data, or private review correspondence.
- State what was actually verified. Local package validation does not prove tenant installation, OAuth completion, tool execution, certification, or store availability.
- Initial repo setup does not authorize Microsoft provisioning, advertising mutations, or marketplace submission. Follow the user's authorization for each subsequent task.
