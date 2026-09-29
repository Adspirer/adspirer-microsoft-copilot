# Microsoft 365 Copilot agent

Planned package: **Adspirer Advertising Agent**, a declarative agent using the existing Adspirer MCP endpoint as a plugin.

This folder currently contains planning documentation only. It has no app manifest, plugin manifest, tenant registration, or installable package.

## Implementation checklist

- Generate the declarative-agent project with the Microsoft 365 Agents Toolkit CLI.
- Configure the MCP plugin for `https://mcp.adspirer.com/mcp` and verify static or dynamic OAuth registration with Adspirer.
- Add agent instructions derived from a recorded revision of the shared `ads-mcp` source.
- Select an initial tool set for account discovery, reporting, and campaign preparation.
- Supply Microsoft-compliant icons and app metadata.
- Validate the package, install it in a test tenant, and verify OAuth, account isolation, reads, and approved writes end to end.

Suggested pilot prompts:

- "Show my connected advertising accounts."
- "Compare last week's Google and Meta campaign performance."
- "Prepare a paused campaign and show its settings for approval."

Pilot data and credentials must be provided privately. Tests that change advertising data require explicit authorization.

## Microsoft references

- [Build an MCP plugin for a declarative agent](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/build-mcp-plugins)
- [Publish agents](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/publish)
