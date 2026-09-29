# Copilot Studio MCP connector

Planned package: an Adspirer MCP connector for customers building their own agents in Copilot Studio.

This folder currently contains planning documentation only. No connector definition or certification package has been created or submitted.

## Implementation checklist

- Confirm the current Microsoft MCP connector packaging contract.
- Prepare connector/OpenAPI definitions, authentication configuration, required metadata and icons, and public `intro.md` documentation.
- Test the declared tools and their permission boundaries through Copilot Studio.
- Prepare a reviewer account, setup instructions, sample prompts, and expected results. Keep credentials outside Git.
- Complete Partner Center business verification and Microsoft 365 and Copilot program enrollment before public submission.

The connector certification package is distinct from the Microsoft 365 declarative-agent package in `agent/`. A future federated connector for direct Copilot data retrieval would also need its applicable manifest, testing, and submission path assessed separately.

## Microsoft references

- [MCP server certification](https://learn.microsoft.com/en-us/microsoft-copilot-studio/mcp-server-certification)
- [Verified publisher certification](https://learn.microsoft.com/en-us/connectors/custom-connectors/submit-for-certification)
- [Prepare connector files](https://learn.microsoft.com/en-us/connectors/custom-connectors/certification-submission)
